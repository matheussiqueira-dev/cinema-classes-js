import { formatDateTime, formatMoney, formatPercent } from '../core/format.js';
import { clamp, parseInteger, parseNumber, safeTrim } from '../core/helpers.js';
import { calculateTicketPrice } from '../domain/pricingEngine.js';

function getSessionMetrics(state) {
  const sales = state.session.sales || [];
  const revenue = sales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);
  const soldSeats = sales.reduce((acc, sale) => acc + Number(sale.seats || 0), 0);
  const capacity = Number(state.session.config?.capacity || 0);
  const available = Math.max(capacity - soldSeats, 0);
  const occupancy = capacity > 0 ? (soldSeats / capacity) * 100 : 0;
  return { revenue, soldSeats, capacity, available, occupancy };
}

function renderSessionState(state) {
  const title = document.getElementById('session-title');
  const summary = document.getElementById('session-summary');
  const occupancyBar = document.getElementById('session-occupancy-bar');
  const occupancyLabel = document.getElementById('session-occupancy-label');
  const salesList = document.getElementById('session-sales-list');
  const salesEmpty = document.getElementById('session-sales-empty');
  const forecast = document.getElementById('session-forecast');
  const sessionGuard = document.getElementById('session-guard');

  const config = state.session.config;
  const metrics = getSessionMetrics(state);

  if (!config) {
    if (title) title.textContent = 'Nenhuma sessão ativa';
    if (summary) summary.textContent = 'Crie uma sessão para iniciar vendas.';
    if (occupancyLabel) occupancyLabel.textContent = 'Ocupação: --';
    if (occupancyBar) occupancyBar.style.width = '0%';
    if (forecast) forecast.textContent = 'Sem previsão enquanto não houver sessão.';
    if (salesList) salesList.innerHTML = '';
    if (salesEmpty) salesEmpty.hidden = false;
    if (sessionGuard) sessionGuard.hidden = false;
    return;
  }

  if (title) title.textContent = `${config.movie} · ${config.room}`;
  if (summary) {
    summary.textContent = `Receita ${formatMoney(metrics.revenue)} • Assentos vendidos ${metrics.soldSeats}/${metrics.capacity} • Disponíveis ${metrics.available}`;
  }
  if (occupancyLabel) {
    occupancyLabel.textContent = `Ocupação: ${formatPercent(metrics.occupancy, 1, { clampRange: true })}`;
  }
  if (occupancyBar) occupancyBar.style.width = `${clamp(metrics.occupancy, 0, 100)}%`;
  if (sessionGuard) sessionGuard.hidden = true;

  const avgSeatsPerSale =
    state.session.sales.length > 0 ? metrics.soldSeats / state.session.sales.length : 0;
  const remainingSalesEstimate =
    avgSeatsPerSale > 0 ? Math.ceil(metrics.available / avgSeatsPerSale) : null;
  if (forecast) {
    forecast.textContent =
      remainingSalesEstimate && Number.isFinite(remainingSalesEstimate)
        ? `Estimativa de lotação: cerca de ${remainingSalesEstimate} vendas no ritmo atual.`
        : 'Registre vendas para gerar previsão de lotação.';
  }

  if (salesList) {
    salesList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    state.session.sales
      .slice()
      .reverse()
      .slice(0, 8)
      .forEach((sale) => {
        const item = document.createElement('li');
        item.className = 'timeline-item';
        item.innerHTML = `
          <p><strong>${sale.type.toUpperCase()}</strong> · ${sale.seats} assentos · ${formatMoney(sale.total)}</p>
          <small>${formatDateTime(sale.createdAt)}</small>
        `;
        fragment.appendChild(item);
      });
    salesList.appendChild(fragment);
  }

  if (salesEmpty) {
    salesEmpty.hidden = state.session.sales.length > 0;
  }
}

function bindGoalForm(store, toast) {
  const form = document.getElementById('session-goal-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const goal = parseNumber(form.elements.revenueGoal.value, 0);
    store.setRevenueGoal(goal);
    toast.show('Meta de receita atualizada.', 'success');
  });
}

export function initSessionView({ store, toast }) {
  const createForm = document.getElementById('session-create-form');
  const saleForm = document.getElementById('session-sale-form');
  const undoButton = document.getElementById('session-undo-sale');
  const saleFamilyInput = document.getElementById('sale-family-size');

  if (!createForm || !saleForm) return () => {};

  bindGoalForm(store, toast);

  const toggleFamilyInput = () => {
    saleFamilyInput.disabled = saleForm.elements.ticketType.value !== 'familia';
  };

  saleForm.elements.ticketType.addEventListener('change', toggleFamilyInput);
  toggleFamilyInput();

  createForm.addEventListener('submit', (event) => {
    event.preventDefault();
    store.createSession({
      movie: safeTrim(createForm.elements.movie.value, 'Sessao sem nome'),
      room: safeTrim(createForm.elements.room.value, 'Sala principal'),
      capacity: parseInteger(createForm.elements.capacity.value, 1),
      basePrice: parseNumber(createForm.elements.basePrice.value, 0),
      dubbed: createForm.elements.dubbed.checked,
    });
    toast.show('Sessão criada com sucesso.', 'success');
  });

  saleForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const state = store.getState();
    const config = state.session.config;
    if (!config) {
      toast.show('Crie uma sessão antes de vender ingressos.', 'error');
      return;
    }

    const metrics = getSessionMetrics(state);
    const pricing = calculateTicketPrice({
      basePrice: config.basePrice,
      ticketType: saleForm.elements.ticketType.value,
      familySize: parseInteger(saleForm.elements.familySize.value, 1),
      quantity: parseInteger(saleForm.elements.quantity.value, 1),
      roomType: saleForm.elements.roomType.value,
      dayOfWeek: saleForm.elements.dayOfWeek.value,
      occupancy: metrics.occupancy,
      loyalty: saleForm.elements.loyalty.value,
      coupon: parseNumber(saleForm.elements.coupon.value, 0),
      dubbed: config.dubbed,
    });

    if (metrics.soldSeats + pricing.consumedSeats > metrics.capacity) {
      toast.show('Venda bloqueada: capacidade da sessão excedida.', 'error');
      return;
    }

    store.addSessionSale({
      type: saleForm.elements.ticketType.value,
      seats: pricing.consumedSeats,
      total: pricing.total,
    });
    toast.show(`Venda registrada: ${formatMoney(pricing.total)}.`, 'success');
  });

  undoButton?.addEventListener('click', () => {
    const undone = store.undoLastSale();
    if (!undone) {
      toast.show('Não há venda para desfazer.', 'info');
      return;
    }
    toast.show('Última venda desfeita.', 'info');
  });

  return store.subscribe((state) => {
    renderSessionState(state);
    const goalForm = document.getElementById('session-goal-form');
    if (goalForm) {
      goalForm.elements.revenueGoal.value = state.session.revenueGoal;
    }
  });
}

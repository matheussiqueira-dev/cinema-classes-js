const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const state = {
  session: null,
  sessionSales: [],
  stock: new Map(),
};

const el = {
  metricOccupancy: document.getElementById('metric-occupancy'),
  metricRevenue: document.getElementById('metric-revenue'),
  metricStock: document.getElementById('metric-stock'),
  toast: document.getElementById('toast'),

  priceForm: document.getElementById('price-form'),
  priceOutputValue: document.querySelector('#price-output .result-value'),
  priceBreakdown: document.getElementById('price-breakdown'),
  priceType: document.getElementById('price-ticket-type'),
  priceFamilySize: document.getElementById('price-family-size'),

  sessionCreateForm: document.getElementById('session-create-form'),
  sessionSaleForm: document.getElementById('session-sale-form'),
  sessionTitle: document.getElementById('session-title'),
  sessionMeterBar: document.getElementById('session-meter-bar'),
  sessionKpis: document.getElementById('session-kpis'),
  sessionSalesLog: document.getElementById('session-sales-log'),
  saleType: document.getElementById('sale-type'),
  saleFamilySize: document.getElementById('sale-family-size'),

  stockItemForm: document.getElementById('stock-item-form'),
  stockMovementForm: document.getElementById('stock-movement-form'),
  stockTableBody: document.getElementById('stock-table-body'),
  movementSku: document.getElementById('movement-sku'),

  clockForm: document.getElementById('clock-form'),
  clockOrigin: document.getElementById('clock-origin'),
  clockTime: document.getElementById('clock-time'),
  clockPeriod: document.getElementById('clock-period'),
  clockBR: document.getElementById('clock-br'),
  clockUS: document.getElementById('clock-us'),
  clockNow: document.getElementById('clock-now'),
};

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatMoney(value) {
  return currencyFormatter.format(toNumber(value));
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    el.toast.classList.remove('visible');
  }, 2400);
}

function isWeekend(day) {
  return day === 'sabado' || day === 'domingo';
}

function calculateTicketPrice({
  basePrice,
  ticketType,
  familySize,
  quantity,
  roomType,
  dayOfWeek,
  occupancy,
  loyalty,
  coupon,
  dubbed,
}) {
  const modifiers = [];
  let unitPrice = toNumber(basePrice, 0);

  const applyModifier = (label, percent) => {
    if (!percent) return;
    const delta = round(unitPrice * (percent / 100));
    unitPrice = round(unitPrice + delta);
    modifiers.push({ label, percent, delta });
  };

  if (roomType === 'vip') applyModifier('Sala VIP', 20);
  if (roomType === 'imax') applyModifier('Sala IMAX', 30);
  if (dubbed) applyModifier('Sessao dublada', 5);
  if (isWeekend(dayOfWeek)) applyModifier('Fim de semana', 10);
  if (toNumber(occupancy, 0) >= 80) applyModifier('Alta demanda da sessao', 12);
  if (loyalty === 'silver') applyModifier('Fidelidade Silver', -5);
  if (loyalty === 'gold') applyModifier('Fidelidade Gold', -10);
  if (toNumber(coupon, 0) > 0) {
    applyModifier('Cupom promocional', -Math.min(toNumber(coupon, 0), 80));
  }

  if (ticketType === 'meia') {
    applyModifier('Meia-entrada legal', -50);
  }

  const normalizedFamilySize = Math.max(1, Math.floor(toNumber(familySize, 1)));
  if (ticketType === 'familia') {
    const deltaFamily = round(unitPrice * normalizedFamilySize - unitPrice);
    unitPrice = round(unitPrice * normalizedFamilySize);
    modifiers.push({
      label: `Multiplicador familia (${normalizedFamilySize} pessoas)`,
      percent: 0,
      delta: deltaFamily,
    });
    if (normalizedFamilySize > 3) {
      applyModifier('Desconto familia', -5);
    }
  }

  const normalizedQuantity = Math.max(1, Math.floor(toNumber(quantity, 1)));
  const consumedSeats = ticketType === 'familia' ? normalizedQuantity * normalizedFamilySize : normalizedQuantity;
  const total = round(unitPrice * normalizedQuantity);

  return {
    unitPrice,
    total,
    consumedSeats,
    quantity: normalizedQuantity,
    modifiers,
  };
}

function renderPriceResult(result) {
  el.priceOutputValue.textContent = formatMoney(result.total);
  el.priceBreakdown.innerHTML = '';
  result.modifiers.forEach((modifier) => {
    const li = document.createElement('li');
    const signal = modifier.delta >= 0 ? '+' : '-';
    li.textContent = `${modifier.label}: ${signal} ${formatMoney(Math.abs(modifier.delta))}`;
    el.priceBreakdown.appendChild(li);
  });

  if (result.modifiers.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Sem ajustes aplicados neste cenário.';
    el.priceBreakdown.appendChild(li);
  }
}

function renderSessionPanel() {
  if (!state.session) {
    el.sessionTitle.textContent = 'Nenhuma sessão criada';
    el.sessionMeterBar.style.width = '0%';
    el.sessionKpis.textContent = 'Lugares disponíveis: -- | Receita: R$ 0,00';
    el.sessionSalesLog.innerHTML = '';
    el.metricOccupancy.textContent = '0%';
    el.metricRevenue.textContent = 'R$ 0,00';
    return;
  }

  const occupancy = state.session.capacity === 0 ? 0 : round((state.session.sold / state.session.capacity) * 100);
  const available = state.session.capacity - state.session.sold;
  el.sessionTitle.textContent = `${state.session.movie} · ${state.session.room}`;
  el.sessionMeterBar.style.width = `${Math.min(occupancy, 100)}%`;
  el.sessionKpis.textContent = `Lugares disponíveis: ${available} | Receita: ${formatMoney(state.session.revenue)}`;

  el.metricOccupancy.textContent = `${occupancy}%`;
  el.metricRevenue.textContent = formatMoney(state.session.revenue);

  el.sessionSalesLog.innerHTML = '';
  const recentSales = state.sessionSales.slice(-5).reverse();
  if (recentSales.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nenhuma venda registrada.';
    el.sessionSalesLog.appendChild(li);
    return;
  }

  recentSales.forEach((sale) => {
    const li = document.createElement('li');
    li.textContent = `${sale.type.toUpperCase()} · ${sale.seats} assentos · ${formatMoney(sale.total)}`;
    el.sessionSalesLog.appendChild(li);
  });
}

function renderStock() {
  el.stockTableBody.innerHTML = '';
  el.movementSku.innerHTML = '';

  const items = Array.from(state.stock.values());
  const criticalCount = items.filter((item) => item.qty <= item.min).length;
  el.metricStock.textContent = String(criticalCount);

  if (items.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5">Nenhum item cadastrado.</td>';
    el.stockTableBody.appendChild(row);
    return;
  }

  items.forEach((item) => {
    const isCritical = item.qty <= item.min;

    const option = document.createElement('option');
    option.value = item.sku;
    option.textContent = `${item.sku} - ${item.name}`;
    el.movementSku.appendChild(option);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.sku}</td>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.min}</td>
      <td class="${isCritical ? 'status-critical' : 'status-ok'}">
        ${isCritical ? 'Crítico' : 'Saudável'}
      </td>
    `;
    el.stockTableBody.appendChild(row);
  });
}

function normalizeTimeParts(timeInput) {
  const [hRaw, mRaw, sRaw] = String(timeInput || '').trim().split(':');
  const h = toNumber(hRaw, -1);
  const m = toNumber(mRaw, -1);
  const s = toNumber(sRaw, -1);
  if (!Number.isInteger(h) || !Number.isInteger(m) || !Number.isInteger(s)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return null;
  return { h, m, s };
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function brToUs({ h, m, s }) {
  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h;
  if (hour12 === 0) hour12 = 12;
  else if (hour12 > 12) hour12 -= 12;
  return `${pad2(hour12)}:${pad2(m)}:${pad2(s)} ${period}`;
}

function usToBr({ h, m, s, period }) {
  let hour24 = h;
  if (period === 'AM' && hour24 === 12) hour24 = 0;
  if (period === 'PM' && hour24 < 12) hour24 += 12;
  return `${pad2(hour24)}:${pad2(m)}:${pad2(s)}`;
}

function updateNowClock() {
  const now = new Date();
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  el.clockNow.textContent = time;
}

function toggleFamilyField(typeSelect, familyInput) {
  familyInput.disabled = typeSelect.value !== 'familia';
}

function bootstrapSampleStock() {
  state.stock.set('PIP-G', { sku: 'PIP-G', name: 'Pipoca Grande', qty: 24, min: 8 });
  state.stock.set('REF-L', { sku: 'REF-L', name: 'Refrigerante Lata', qty: 16, min: 10 });
  renderStock();
}

el.priceForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const result = calculateTicketPrice({
    basePrice: document.getElementById('price-base').value,
    ticketType: el.priceType.value,
    familySize: el.priceFamilySize.value,
    quantity: document.getElementById('price-quantity').value,
    roomType: document.getElementById('price-room').value,
    dayOfWeek: document.getElementById('price-day').value,
    occupancy: document.getElementById('price-occupancy').value,
    loyalty: document.getElementById('price-loyalty').value,
    coupon: document.getElementById('price-coupon').value,
    dubbed: document.getElementById('price-dubbed').checked,
  });

  renderPriceResult(result);
});

el.sessionCreateForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const capacity = Math.max(1, Math.floor(toNumber(document.getElementById('session-capacity').value, 1)));
  state.session = {
    movie: document.getElementById('session-movie').value.trim() || 'Sessao sem nome',
    room: document.getElementById('session-room').value.trim() || 'Sala principal',
    capacity,
    basePrice: Math.max(0, toNumber(document.getElementById('session-base-price').value, 0)),
    dubbed: document.getElementById('session-dubbed').checked,
    sold: 0,
    revenue: 0,
  };
  state.sessionSales = [];
  renderSessionPanel();
  showToast('Sessão criada com sucesso.');
});

el.sessionSaleForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!state.session) {
    showToast('Crie uma sessão antes de registrar vendas.');
    return;
  }

  const currentOccupancy = state.session.capacity === 0 ? 0 : (state.session.sold / state.session.capacity) * 100;
  const salePreview = calculateTicketPrice({
    basePrice: state.session.basePrice,
    ticketType: el.saleType.value,
    familySize: el.saleFamilySize.value,
    quantity: document.getElementById('sale-quantity').value,
    roomType: 'padrao',
    dayOfWeek: document.getElementById('sale-day').value,
    occupancy: currentOccupancy,
    loyalty: document.getElementById('sale-loyalty').value,
    coupon: 0,
    dubbed: state.session.dubbed,
  });

  if (state.session.sold + salePreview.consumedSeats > state.session.capacity) {
    showToast('Venda bloqueada: capacidade da sessão excedida.');
    return;
  }

  state.session.sold += salePreview.consumedSeats;
  state.session.revenue = round(state.session.revenue + salePreview.total);
  state.sessionSales.push({
    type: el.saleType.value,
    total: salePreview.total,
    seats: salePreview.consumedSeats,
  });

  renderSessionPanel();
  showToast(`Venda registrada: ${formatMoney(salePreview.total)}.`);
});

el.stockItemForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const sku = document.getElementById('stock-sku').value.trim().toUpperCase();
  const name = document.getElementById('stock-name').value.trim();
  const qty = Math.max(0, Math.floor(toNumber(document.getElementById('stock-qty').value, 0)));
  const min = Math.max(0, Math.floor(toNumber(document.getElementById('stock-min').value, 0)));

  if (!sku || !name) {
    showToast('Informe SKU e nome válidos para o item.');
    return;
  }

  state.stock.set(sku, { sku, name, qty, min });
  renderStock();
  showToast(`Item ${sku} cadastrado/atualizado.`);
  el.stockItemForm.reset();
});

el.stockMovementForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const sku = el.movementSku.value;
  const movementType = document.getElementById('movement-type').value;
  const qty = Math.max(1, Math.floor(toNumber(document.getElementById('movement-qty').value, 1)));
  const item = state.stock.get(sku);

  if (!item) {
    showToast('Selecione um SKU válido.');
    return;
  }

  if (movementType === 'entrada') {
    item.qty += qty;
  } else {
    if (qty > item.qty) {
      showToast('Saída maior que saldo atual.');
      return;
    }
    item.qty -= qty;
  }

  state.stock.set(sku, item);
  renderStock();
  showToast(`Movimento aplicado para ${sku}.`);
});

el.clockForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const origin = el.clockOrigin.value;
  const timeParts = normalizeTimeParts(el.clockTime.value);
  if (!timeParts) {
    showToast('Horário inválido. Use HH:MM:SS.');
    return;
  }

  if (origin === 'br') {
    el.clockBR.textContent = `${pad2(timeParts.h)}:${pad2(timeParts.m)}:${pad2(timeParts.s)}`;
    el.clockUS.textContent = brToUs(timeParts);
  } else {
    if (timeParts.h < 1 || timeParts.h > 12) {
      showToast('No formato americano, use hora entre 01 e 12.');
      return;
    }

    const period = el.clockPeriod.value;
    el.clockUS.textContent = `${pad2(timeParts.h)}:${pad2(timeParts.m)}:${pad2(timeParts.s)} ${period}`;
    el.clockBR.textContent = usToBr({ ...timeParts, period });
  }
  showToast('Relógios sincronizados.');
});

el.priceType.addEventListener('change', () => toggleFamilyField(el.priceType, el.priceFamilySize));
el.saleType.addEventListener('change', () => toggleFamilyField(el.saleType, el.saleFamilySize));

toggleFamilyField(el.priceType, el.priceFamilySize);
toggleFamilyField(el.saleType, el.saleFamilySize);
bootstrapSampleStock();
renderSessionPanel();
updateNowClock();
setInterval(updateNowClock, 1000);

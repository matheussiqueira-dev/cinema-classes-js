import { formatMoney, formatPercent } from '../core/format.js';
import { parseInteger, parseNumber } from '../core/helpers.js';
import { calculateTicketPrice, createPriceRecommendation } from '../domain/pricingEngine.js';

function extractPricingFormData(form) {
  const formData = new FormData(form);
  return {
    basePrice: parseNumber(formData.get('basePrice'), 0),
    ticketType: String(formData.get('ticketType') || 'inteira'),
    familySize: parseInteger(formData.get('familySize'), 1),
    quantity: parseInteger(formData.get('quantity'), 1),
    roomType: String(formData.get('roomType') || 'padrao'),
    dayOfWeek: String(formData.get('dayOfWeek') || 'segunda'),
    occupancy: parseNumber(formData.get('occupancy'), 0),
    loyalty: String(formData.get('loyalty') || 'nenhum'),
    coupon: parseNumber(formData.get('coupon'), 0),
    dubbed: formData.get('dubbed') === 'on',
    anticipationDays: parseInteger(formData.get('anticipationDays'), 7),
  };
}

function renderPricingResult(result, recommendation) {
  const totalEl = document.getElementById('price-output-total');
  const unitEl = document.getElementById('price-output-unit');
  const deltaEl = document.getElementById('price-output-delta');
  const breakdownEl = document.getElementById('price-breakdown-list');
  const recommendationEl = document.getElementById('price-recommendation');

  if (totalEl) totalEl.textContent = formatMoney(result.total);
  if (unitEl) unitEl.textContent = `Unitário: ${formatMoney(result.unitPrice)}`;
  if (deltaEl) {
    const signal = result.deltaPercent >= 0 ? '+' : '';
    deltaEl.textContent = `Variação: ${signal}${formatPercent(result.deltaPercent, 1)}`;
    deltaEl.dataset.trend = result.deltaPercent >= 0 ? 'up' : 'down';
  }

  if (breakdownEl) {
    breakdownEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const modifiers = result.modifiers.length > 0 ? result.modifiers : [{ label: 'Sem ajustes aplicados', delta: 0 }];
    modifiers.forEach((modifier) => {
      const item = document.createElement('li');
      const polarity = modifier.delta >= 0 ? '+' : '-';
      item.textContent = `${modifier.label}: ${polarity} ${formatMoney(Math.abs(modifier.delta))}`;
      fragment.appendChild(item);
    });
    breakdownEl.appendChild(fragment);
  }

  if (recommendationEl) {
    recommendationEl.innerHTML = '';
    const summary = document.createElement('p');
    summary.textContent = `Preço sugerido de referência: ${formatMoney(recommendation.suggestedPrice)} (${recommendation.adjustmentPercent > 0 ? '+' : ''}${formatPercent(recommendation.adjustmentPercent, 1)})`;
    recommendationEl.appendChild(summary);

    if (recommendation.factors.length > 0) {
      const list = document.createElement('ul');
      recommendation.factors.forEach((factor) => {
        const item = document.createElement('li');
        item.textContent = `${factor.label}: ${factor.percent > 0 ? '+' : ''}${factor.percent}%`;
        list.appendChild(item);
      });
      recommendationEl.appendChild(list);
    }
  }
}

function renderScenarios(store) {
  const list = document.getElementById('scenario-list');
  const empty = document.getElementById('scenario-empty');
  if (!list) return;

  const state = store.getState();
  const scenarios = state.pricing.scenarios;

  list.innerHTML = '';
  const fragment = document.createDocumentFragment();

  scenarios.forEach((scenario) => {
    const item = document.createElement('li');
    item.className = 'scenario-item';

    const content = document.createElement('button');
    content.type = 'button';
    content.className = 'scenario-apply';
    content.dataset.action = 'apply';
    content.dataset.id = scenario.id;
    content.textContent = `${scenario.label} - ${formatMoney(scenario.result.total)}`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'scenario-remove';
    remove.dataset.action = 'remove';
    remove.dataset.id = scenario.id;
    remove.setAttribute('aria-label', `Remover cenário ${scenario.label}`);
    remove.textContent = 'Remover';

    item.appendChild(content);
    item.appendChild(remove);
    fragment.appendChild(item);
  });

  list.appendChild(fragment);

  if (empty) {
    empty.hidden = scenarios.length > 0;
  }
}

function fillFormWithScenario(form, scenario) {
  form.elements.basePrice.value = scenario.input.basePrice;
  form.elements.ticketType.value = scenario.input.ticketType;
  form.elements.familySize.value = scenario.input.familySize;
  form.elements.quantity.value = scenario.input.quantity;
  form.elements.roomType.value = scenario.input.roomType;
  form.elements.dayOfWeek.value = scenario.input.dayOfWeek;
  form.elements.occupancy.value = scenario.input.occupancy;
  form.elements.loyalty.value = scenario.input.loyalty;
  form.elements.coupon.value = scenario.input.coupon;
  form.elements.dubbed.checked = scenario.input.dubbed;
  form.elements.anticipationDays.value = scenario.input.anticipationDays;

  form.dispatchEvent(new Event('submit'));
}

export function initPricingView({ store, toast }) {
  const form = document.getElementById('price-form');
  const saveButton = document.getElementById('price-save-scenario');
  const scenarioList = document.getElementById('scenario-list');
  const clearButton = document.getElementById('scenario-clear');
  const familyInput = document.getElementById('price-family-size');

  if (!form || !scenarioList) return () => {};

  const toggleFamilyInput = () => {
    familyInput.disabled = form.elements.ticketType.value !== 'familia';
  };

  form.elements.ticketType.addEventListener('change', toggleFamilyInput);
  toggleFamilyInput();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = extractPricingFormData(form);
    const result = calculateTicketPrice(input);
    const recommendation = createPriceRecommendation({
      basePrice: input.basePrice,
      occupancy: input.occupancy,
      dayOfWeek: input.dayOfWeek,
      anticipationDays: input.anticipationDays,
      roomType: input.roomType,
    });

    store.setPricingResult({ input, result, recommendation });
    renderPricingResult(result, recommendation);
  });

  saveButton?.addEventListener('click', () => {
    const latest = store.getState().pricing.lastResult;
    if (!latest) {
      toast.show('Calcule um preço antes de salvar cenário.', 'error');
      return;
    }

    const scenarioLabel = `${latest.input.ticketType.toUpperCase()} • ${latest.input.roomType.toUpperCase()} • ${latest.input.dayOfWeek}`;
    store.addScenario({
      label: scenarioLabel,
      createdAt: new Date().toISOString(),
      input: latest.input,
      result: latest.result,
      recommendation: latest.recommendation,
    });
    toast.show('Cenário salvo para comparação.', 'success');
    renderScenarios(store);
  });

  clearButton?.addEventListener('click', () => {
    store.clearScenarios();
    renderScenarios(store);
    toast.show('Cenários limpos.', 'info');
  });

  scenarioList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    const scenarioId = target.dataset.id;
    if (!action || !scenarioId) return;

    const scenario = store.getState().pricing.scenarios.find((item) => item.id === scenarioId);
    if (!scenario) return;

    if (action === 'remove') {
      store.removeScenario(scenarioId);
      renderScenarios(store);
      return;
    }

    fillFormWithScenario(form, scenario);
    toast.show(`Cenário "${scenario.label}" aplicado.`, 'success');
  });

  const unsubscribe = store.subscribe((state) => {
    renderScenarios(store);
    if (!state.pricing.lastResult) return;
    renderPricingResult(state.pricing.lastResult.result, state.pricing.lastResult.recommendation);
  });

  form.dispatchEvent(new Event('submit'));

  return unsubscribe;
}

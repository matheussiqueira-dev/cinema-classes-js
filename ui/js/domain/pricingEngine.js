import { clamp, parseInteger, parseNumber, roundCurrency } from '../core/helpers.js';

const LOYALTY_DISCOUNT = {
  nenhum: 0,
  silver: 5,
  gold: 10,
};

function isWeekend(dayOfWeek) {
  return dayOfWeek === 'sabado' || dayOfWeek === 'domingo';
}

function applyModifier(currentValue, percent) {
  const delta = roundCurrency(currentValue * (percent / 100));
  return {
    nextValue: roundCurrency(currentValue + delta),
    delta,
  };
}

export function calculateTicketPrice({
  basePrice,
  ticketType,
  familySize = 1,
  quantity = 1,
  roomType = 'padrao',
  dayOfWeek = 'segunda',
  occupancy = 0,
  loyalty = 'nenhum',
  coupon = 0,
  dubbed = false,
}) {
  const modifiers = [];
  let unitPrice = Math.max(parseNumber(basePrice, 0), 0);

  const addModifier = (label, percent) => {
    if (!percent) return;
    const { nextValue, delta } = applyModifier(unitPrice, percent);
    unitPrice = nextValue;
    modifiers.push({ label, percent, delta });
  };

  if (roomType === 'vip') addModifier('Sala VIP', 20);
  if (roomType === 'imax') addModifier('Sala IMAX', 30);
  if (dubbed) addModifier('Sessao dublada', 5);
  if (isWeekend(dayOfWeek)) addModifier('Demanda de fim de semana', 10);

  if (parseNumber(occupancy, 0) >= 80) {
    addModifier('Alta ocupacao', 12);
  } else if (parseNumber(occupancy, 0) < 35) {
    addModifier('Baixa ocupacao', -8);
  }

  const loyaltyDiscount = LOYALTY_DISCOUNT[loyalty] || 0;
  if (loyaltyDiscount > 0) addModifier(`Desconto fidelidade (${loyalty})`, -loyaltyDiscount);

  const couponPercent = clamp(parseNumber(coupon, 0), 0, 80);
  if (couponPercent > 0) addModifier('Cupom promocional', -couponPercent);

  if (ticketType === 'meia') {
    addModifier('Meia-entrada legal', -50);
  }

  const normalizedFamilySize = Math.max(1, parseInteger(familySize, 1));
  if (ticketType === 'familia') {
    const familyDelta = roundCurrency(unitPrice * normalizedFamilySize - unitPrice);
    unitPrice = roundCurrency(unitPrice * normalizedFamilySize);
    modifiers.push({
      label: `Multiplicador familia (${normalizedFamilySize} pessoas)`,
      percent: 0,
      delta: familyDelta,
    });

    if (normalizedFamilySize > 3) {
      addModifier('Desconto familia', -5);
    }
  }

  const normalizedQuantity = Math.max(1, parseInteger(quantity, 1));
  const consumedSeats =
    ticketType === 'familia' ? normalizedFamilySize * normalizedQuantity : normalizedQuantity;
  const total = roundCurrency(unitPrice * normalizedQuantity);
  const totalDelta = roundCurrency(total - roundCurrency(parseNumber(basePrice, 0) * normalizedQuantity));
  const deltaPercent =
    parseNumber(basePrice, 0) === 0
      ? 0
      : roundCurrency((totalDelta / (parseNumber(basePrice, 0) * normalizedQuantity)) * 100);

  return {
    basePrice: roundCurrency(parseNumber(basePrice, 0)),
    unitPrice,
    quantity: normalizedQuantity,
    consumedSeats,
    total,
    totalDelta,
    deltaPercent,
    modifiers,
  };
}

export function createPriceRecommendation({
  basePrice,
  occupancy = 50,
  dayOfWeek = 'segunda',
  anticipationDays = 7,
  roomType = 'padrao',
}) {
  const base = Math.max(parseNumber(basePrice, 0), 0);
  let adjustment = 0;
  const factors = [];

  const addFactor = (label, percent) => {
    if (!percent) return;
    adjustment += percent;
    factors.push({ label, percent });
  };

  const occupancyValue = clamp(parseNumber(occupancy, 0), 0, 100);
  if (occupancyValue >= 85) addFactor('Demanda forte', 15);
  if (occupancyValue >= 65 && occupancyValue < 85) addFactor('Demanda moderada', 7);
  if (occupancyValue < 35) addFactor('Demanda fraca', -10);

  const anticipationValue = clamp(parseInteger(anticipationDays, 7), 0, 365);
  if (anticipationValue <= 2) addFactor('Compra de ultima hora', 6);
  if (anticipationValue >= 10) addFactor('Compra antecipada', -7);

  if (isWeekend(dayOfWeek)) addFactor('Fim de semana', 8);
  if (dayOfWeek === 'terca' || dayOfWeek === 'quarta') addFactor('Dia de baixa demanda', -5);

  if (roomType === 'vip') addFactor('Sala VIP', 18);
  if (roomType === 'imax') addFactor('Sala IMAX', 28);

  const suggested = roundCurrency(base * (1 + adjustment / 100));

  return {
    basePrice: base,
    suggestedPrice: suggested,
    adjustmentPercent: roundCurrency(adjustment),
    factors,
  };
}

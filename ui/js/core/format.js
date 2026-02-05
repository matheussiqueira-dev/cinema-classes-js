import { clamp, parseNumber } from './helpers.js';

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatMoney(value) {
  return brlFormatter.format(parseNumber(value, 0));
}

export function formatPercent(value, digits = 1, { clampRange = false } = {}) {
  const raw = parseNumber(value, 0);
  const normalized = clampRange ? clamp(raw, 0, 100) : raw;
  return `${normalized.toFixed(digits)}%`;
}

export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function pad2(value) {
  return String(value).padStart(2, '0');
}

export function formatClockTime({ hour, minute, second }) {
  return `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
}

export function getTimePartsFromString(value) {
  const [hourRaw, minuteRaw, secondRaw] = String(value || '').trim().split(':');
  const hour = parseNumber(hourRaw, -1);
  const minute = parseNumber(minuteRaw, -1);
  const second = parseNumber(secondRaw, -1);

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || !Number.isInteger(second)) {
    return null;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }

  return { hour, minute, second };
}

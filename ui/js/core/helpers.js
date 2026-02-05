export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

export function safeTrim(value, fallback = '') {
  const parsed = String(value ?? '').trim();
  return parsed.length === 0 ? fallback : parsed;
}

export function uid(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 9);
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${random}`;
}

export function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function mergeWithDefaults(defaults, incoming) {
  if (!incoming || typeof incoming !== 'object') {
    return deepClone(defaults);
  }

  const output = Array.isArray(defaults) ? [] : {};
  const keys = new Set([...Object.keys(defaults), ...Object.keys(incoming)]);

  keys.forEach((key) => {
    const defaultValue = defaults[key];
    const incomingValue = incoming[key];

    if (Array.isArray(defaultValue)) {
      output[key] = Array.isArray(incomingValue) ? incomingValue : deepClone(defaultValue);
      return;
    }

    if (
      defaultValue &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue) &&
      incomingValue &&
      typeof incomingValue === 'object' &&
      !Array.isArray(incomingValue)
    ) {
      output[key] = mergeWithDefaults(defaultValue, incomingValue);
      return;
    }

    output[key] =
      typeof incomingValue === 'undefined' ? deepClone(defaultValue) : deepClone(incomingValue);
  });

  return output;
}

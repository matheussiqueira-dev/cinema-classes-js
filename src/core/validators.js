const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;

function ensureNumber(
  value,
  { label = 'Valor', min = -Infinity, max = Infinity, integer = false } = {}
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} invalido`);
  }

  if (integer && !Number.isInteger(parsed)) {
    throw new Error(`${label} deve ser inteiro`);
  }

  if (parsed < min || parsed > max) {
    throw new Error(`${label} fora do intervalo permitido`);
  }

  return parsed;
}

function ensureString(
  value,
  { label = 'Texto', allowEmpty = false, maxLength = Infinity } = {}
) {
  const parsed = String(value ?? '').trim();

  if (!allowEmpty && parsed.length === 0) {
    throw new Error(`${label} nao pode ser vazio`);
  }

  if (parsed.length > maxLength) {
    throw new Error(`${label} acima do limite permitido`);
  }

  return parsed;
}

function ensureBoolean(value) {
  return Boolean(value);
}

function ensureEmail(value, { label = 'Email', allowEmpty = false } = {}) {
  const parsed = ensureString(value, { label, allowEmpty });
  if (allowEmpty && parsed.length === 0) {
    return parsed;
  }

  if (!EMAIL_REGEX.test(parsed)) {
    throw new Error(`${label} invalido`);
  }

  return parsed.toLowerCase();
}

function ensureObject(value, { label = 'Objeto' } = {}) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} invalido`);
  }
  return value;
}

function ensureArray(value, { label = 'Lista' } = {}) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} invalida`);
  }
  return value;
}

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

module.exports = {
  ensureArray,
  ensureBoolean,
  ensureEmail,
  ensureNumber,
  ensureObject,
  ensureString,
  roundCurrency,
};

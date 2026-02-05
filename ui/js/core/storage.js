import { mergeWithDefaults } from './helpers.js';

export function loadFromStorage(storageKey, defaults) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return mergeWithDefaults(defaults, {});
    const parsed = JSON.parse(raw);
    return mergeWithDefaults(defaults, parsed);
  } catch (error) {
    console.warn('[storage] Falha ao carregar estado local:', error);
    return mergeWithDefaults(defaults, {});
  }
}

export function createStateSaver(storageKey, delay = 250) {
  let timerId = null;

  return (state) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn('[storage] Falha ao salvar estado local:', error);
      }
    }, delay);
  };
}

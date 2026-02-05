import { deepClone, mergeWithDefaults, parseInteger, parseNumber, safeTrim, uid } from '../core/helpers.js';
import { createStateSaver, loadFromStorage } from '../core/storage.js';

const STORAGE_KEY = 'cinema_ops_frontend_v2';

const DEFAULT_STATE = {
  ui: {
    activeView: 'pricing',
  },
  pricing: {
    lastResult: null,
    scenarios: [],
  },
  session: {
    config: null,
    sales: [],
    revenueGoal: 2000,
  },
  stock: {
    items: [
      { sku: 'PIP-G', name: 'Pipoca Grande', qty: 24, min: 8 },
      { sku: 'REF-L', name: 'Refrigerante Lata', qty: 16, min: 10 },
    ],
    history: [],
  },
  clock: {
    lastSync: {
      br: '00:00:00',
      us: '12:00:00 AM',
      source: 'br',
      updatedAt: null,
    },
  },
};

export function createCinemaStore() {
  let state = loadFromStorage(STORAGE_KEY, DEFAULT_STATE);
  const listeners = new Set();
  const persistState = createStateSaver(STORAGE_KEY);

  const notify = () => {
    const snapshot = deepClone(state);
    listeners.forEach((listener) => listener(snapshot));
  };

  const update = (mutator) => {
    const draft = deepClone(state);
    mutator(draft);
    state = draft;
    persistState(state);
    notify();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      listener(deepClone(state));
      return () => listeners.delete(listener);
    },

    getState() {
      return deepClone(state);
    },

    setActiveView(viewId) {
      update((draft) => {
        draft.ui.activeView = safeTrim(viewId, 'pricing');
      });
    },

    setPricingResult(result) {
      update((draft) => {
        draft.pricing.lastResult = result;
      });
    },

    addScenario(scenario) {
      update((draft) => {
        draft.pricing.scenarios.unshift({
          id: uid('scenario'),
          ...scenario,
        });
        draft.pricing.scenarios = draft.pricing.scenarios.slice(0, 8);
      });
    },

    removeScenario(scenarioId) {
      update((draft) => {
        draft.pricing.scenarios = draft.pricing.scenarios.filter((scenario) => scenario.id !== scenarioId);
      });
    },

    clearScenarios() {
      update((draft) => {
        draft.pricing.scenarios = [];
      });
    },

    createSession(config) {
      update((draft) => {
        draft.session.config = {
          movie: safeTrim(config.movie, 'Sessao sem nome'),
          room: safeTrim(config.room, 'Sala principal'),
          capacity: Math.max(1, parseInteger(config.capacity, 1)),
          basePrice: Math.max(0, parseNumber(config.basePrice, 0)),
          dubbed: Boolean(config.dubbed),
        };
        draft.session.sales = [];
      });
    },

    addSessionSale(sale) {
      update((draft) => {
        draft.session.sales.push({
          id: uid('sale'),
          ...sale,
          createdAt: new Date().toISOString(),
        });
      });
    },

    undoLastSale() {
      const current = deepClone(state);
      if (current.session.sales.length === 0) return false;

      update((draft) => {
        draft.session.sales.pop();
      });
      return true;
    },

    setRevenueGoal(value) {
      update((draft) => {
        draft.session.revenueGoal = Math.max(0, parseNumber(value, 0));
      });
    },

    upsertStockItem(item) {
      update((draft) => {
        const sku = safeTrim(item.sku).toUpperCase();
        const index = draft.stock.items.findIndex((stockItem) => stockItem.sku === sku);
        const normalizedItem = {
          sku,
          name: safeTrim(item.name, 'Item sem nome'),
          qty: Math.max(0, parseInteger(item.qty, 0)),
          min: Math.max(0, parseInteger(item.min, 0)),
        };

        if (index === -1) {
          draft.stock.items.push(normalizedItem);
        } else {
          draft.stock.items[index] = normalizedItem;
        }
      });
    },

    applyStockMovement({ sku, type, qty }) {
      const normalizedSku = safeTrim(sku).toUpperCase();
      const normalizedQty = Math.max(1, parseInteger(qty, 1));

      const current = deepClone(state);
      const target = current.stock.items.find((item) => item.sku === normalizedSku);
      if (!target) {
        return { ok: false, message: 'SKU nao encontrado.' };
      }

      if (type === 'saida' && normalizedQty > target.qty) {
        return { ok: false, message: 'Saida maior que saldo disponivel.' };
      }

      update((draft) => {
        const item = draft.stock.items.find((stockItem) => stockItem.sku === normalizedSku);
        if (!item) return;

        if (type === 'entrada') item.qty += normalizedQty;
        if (type === 'saida') item.qty -= normalizedQty;

        draft.stock.history.push({
          id: uid('stock'),
          sku: normalizedSku,
          type,
          qty: normalizedQty,
          createdAt: new Date().toISOString(),
        });
      });

      return { ok: true, message: 'Movimento aplicado.' };
    },

    undoLastStockMovement() {
      const current = deepClone(state);
      const lastMovement = current.stock.history.at(-1);
      if (!lastMovement) return { ok: false, message: 'Sem movimento para desfazer.' };

      const target = current.stock.items.find((item) => item.sku === lastMovement.sku);
      if (!target) return { ok: false, message: 'Item de estoque nao encontrado para desfazer.' };

      if (lastMovement.type === 'entrada' && target.qty < lastMovement.qty) {
        return { ok: false, message: 'Nao foi possivel desfazer a entrada.' };
      }

      update((draft) => {
        const item = draft.stock.items.find((stockItem) => stockItem.sku === lastMovement.sku);
        if (!item) return;

        if (lastMovement.type === 'entrada') item.qty -= lastMovement.qty;
        if (lastMovement.type === 'saida') item.qty += lastMovement.qty;

        draft.stock.history.pop();
      });

      return { ok: true, message: 'Ultimo movimento desfeito.' };
    },

    setLastClockSync(payload) {
      update((draft) => {
        draft.clock.lastSync = {
          ...payload,
          updatedAt: new Date().toISOString(),
        };
      });
    },

    resetWorkspace() {
      update((draft) => {
        Object.assign(draft, deepClone(DEFAULT_STATE));
      });
    },

    importWorkspace(snapshot) {
      update((draft) => {
        const merged = mergeWithDefaults(DEFAULT_STATE, snapshot || {});
        Object.assign(draft, merged);
      });
    },

    exportWorkspace() {
      return deepClone(state);
    },
  };
}

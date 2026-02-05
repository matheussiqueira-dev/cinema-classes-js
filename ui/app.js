import { createApiClient } from './js/core/apiClient.js';
import { initBackendIntegration } from './js/features/backendIntegration.js';
import { createToast } from './js/core/toast.js';
import { initClockView } from './js/features/clockView.js';
import { initDashboard } from './js/features/dashboard.js';
import { initNavigation } from './js/features/navigation.js';
import { initPricingView } from './js/features/pricingView.js';
import { initSessionView } from './js/features/sessionView.js';
import { initStockView } from './js/features/stockView.js';
import { initWorkspaceActions } from './js/features/workspaceActions.js';
import { createCinemaStore } from './js/state/store.js';

const store = createCinemaStore();
const toast = createToast(document.getElementById('toast'));
const apiClient = createApiClient({ store });

const disposers = [
  initBackendIntegration({ store, apiClient, toast }),
  initNavigation({ store }),
  initDashboard({ store }),
  initPricingView({ store, toast }),
  initSessionView({ store, toast }),
  initStockView({ store, toast }),
  initClockView({ store, toast }),
];

initWorkspaceActions({ store, toast });

window.addEventListener('beforeunload', () => {
  disposers.forEach((dispose) => {
    if (typeof dispose === 'function') dispose();
  });
});

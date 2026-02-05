import { formatDateTime } from '../core/format.js';
import { safeTrim } from '../core/helpers.js';

function renderStatus(state) {
  const status = document.getElementById('backend-status');
  const syncInfo = document.getElementById('backend-sync-info');
  const metrics = document.getElementById('backend-metrics');

  if (status) {
    if (!state.backend.session) {
      status.textContent = 'API desconectada.';
      status.dataset.state = 'idle';
    } else {
      const role = state.backend.session.user?.cargo || 'usuario';
      status.textContent = `Conectado como ${state.backend.session.user?.email || 'desconhecido'} (${role}).`;
      status.dataset.state = 'connected';
    }
  }

  if (syncInfo) {
    if (state.backend.lastSyncAt) {
      syncInfo.textContent = `Última sincronização: ${formatDateTime(state.backend.lastSyncAt)}.`;
    } else {
      syncInfo.textContent = 'Sem sincronização com backend.';
    }

    if (state.backend.syncError) {
      syncInfo.textContent += ` Erro: ${state.backend.syncError}`;
    }
  }

  if (metrics) {
    const data = state.backend.systemMetrics;
    if (!data) {
      metrics.textContent = 'Métricas de backend indisponíveis.';
      return;
    }

    metrics.textContent = `Uptime ${Math.round(Number(data.uptimeSeconds || 0))}s • Sessões ${Number(
      data.activeSessions || 0
    )} • Itens em estoque ${Number(data.inventoryItems || 0)}`;
  }
}

export function initBackendIntegration({ store, apiClient, toast }) {
  const form = document.getElementById('backend-auth-form');
  const syncButton = document.getElementById('backend-sync');
  const disconnectButton = document.getElementById('backend-disconnect');

  if (!form) return () => {};

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const baseUrl = safeTrim(form.elements.baseUrl.value, 'http://localhost:3333/api/v1');
    store.setBackendBaseUrl(baseUrl);

    try {
      const result = await apiClient.login({
        email: form.elements.email.value,
        password: form.elements.password.value,
      });

      store.setBackendSession({
        accessToken: result.accessToken,
        csrfToken: result.csrfToken,
        tokenType: result.tokenType,
        expiresIn: result.expiresIn,
        user: result.user,
      });
      form.elements.password.value = '';
      toast.show('Backend autenticado com sucesso.', 'success');
    } catch (error) {
      toast.show(error.message || 'Falha ao autenticar no backend.', 'error');
    }
  });

  syncButton?.addEventListener('click', async () => {
    const current = store.getState();
    if (!current.backend.session) {
      toast.show('Autentique-se para sincronizar com o backend.', 'error');
      return;
    }

    store.setBackendSyncState({ status: 'syncing', error: null });
    try {
      const [snapshot, systemMetrics] = await Promise.all([
        apiClient.getWorkspaceSnapshot(),
        apiClient.getSystemMetrics(),
      ]);

      store.hydrateFromBackendSnapshot(snapshot);
      store.setBackendSystemMetrics(systemMetrics);
      store.setBackendSyncState({ status: 'success', error: null });
      toast.show('Sincronização com backend concluída.', 'success');
    } catch (error) {
      store.setBackendSyncState({
        status: 'error',
        error: error.message || 'Falha de sincronização.',
      });
      toast.show(error.message || 'Falha na sincronização com backend.', 'error');
    }
  });

  disconnectButton?.addEventListener('click', () => {
    store.clearBackendSession();
    toast.show('Sessão de backend encerrada.', 'info');
  });

  return store.subscribe((state) => {
    if (form.elements.baseUrl.value !== state.backend.baseUrl) {
      form.elements.baseUrl.value = state.backend.baseUrl;
    }
    renderStatus(state);
  });
}

import { safeTrim } from './helpers.js';

function shouldAttachCsrf(method) {
  const normalized = String(method || 'GET').toUpperCase();
  return normalized === 'POST' || normalized === 'PATCH' || normalized === 'PUT' || normalized === 'DELETE';
}

export function createApiClient({ store }) {
  async function request(path, { method = 'GET', body = null, auth = true, csrf = true } = {}) {
    const state = store.getState();
    const baseUrl = safeTrim(state.backend.baseUrl, 'http://localhost:3333/api/v1').replace(/\/+$/, '');
    const headers = {
      Accept: 'application/json',
    };

    if (body !== null) {
      headers['Content-Type'] = 'application/json';
    }

    if (auth && state.backend.session?.accessToken) {
      headers.Authorization = `Bearer ${state.backend.session.accessToken}`;
    }

    if (csrf && shouldAttachCsrf(method) && state.backend.session?.csrfToken) {
      headers['X-CSRF-Token'] = state.backend.session.csrfToken;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined,
    });

    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        payload?.message ||
        (typeof payload === 'string' ? payload : 'Falha na requisicao da API');
      throw new Error(message);
    }

    if (isJson) {
      return payload.data ?? payload;
    }

    return payload;
  }

  return {
    login(credentials) {
      return request('/auth/login', {
        method: 'POST',
        body: credentials,
        auth: false,
        csrf: false,
      });
    },

    getWorkspaceSnapshot() {
      return request('/analytics/workspace-snapshot');
    },

    getSystemMetrics() {
      return request('/analytics/system');
    },
  };
}

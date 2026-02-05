import { downloadJson, readJsonFile } from '../core/fileTransfer.js';

function createSnapshotName() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  return `cinema-ops-snapshot-${date}.json`;
}

export function initWorkspaceActions({ store, toast }) {
  const exportButton = document.getElementById('btn-export-workspace');
  const importButton = document.getElementById('btn-import-workspace');
  const importInput = document.getElementById('input-import-workspace');
  const resetButton = document.getElementById('btn-reset-workspace');

  exportButton?.addEventListener('click', () => {
    const snapshot = store.exportWorkspace();
    downloadJson(createSnapshotName(), snapshot);
    toast.show('Snapshot exportado com sucesso.', 'success');
  });

  importButton?.addEventListener('click', () => {
    importInput?.click();
  });

  importInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const snapshot = await readJsonFile(file);
      store.importWorkspace(snapshot);
      toast.show('Snapshot importado com sucesso.', 'success');
    } catch (error) {
      toast.show(error.message || 'Falha ao importar snapshot.', 'error');
    } finally {
      event.target.value = '';
    }
  });

  resetButton?.addEventListener('click', () => {
    const allowed = window.confirm('Deseja resetar o workspace para o estado inicial?');
    if (!allowed) return;
    store.resetWorkspace();
    toast.show('Workspace resetado.', 'info');
  });

  window.addEventListener('keydown', (event) => {
    const ctrlOrMeta = event.ctrlKey || event.metaKey;
    if (!ctrlOrMeta) return;

    if (event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      const snapshot = store.exportWorkspace();
      downloadJson(createSnapshotName(), snapshot);
      toast.show('Snapshot exportado (atalho).', 'success');
    }
  });
}

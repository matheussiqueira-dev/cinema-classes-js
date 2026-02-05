import { parseInteger, safeTrim } from '../core/helpers.js';

function populateSkuOptions(items, selectElement) {
  if (!selectElement) return;
  selectElement.innerHTML = '';
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.sku;
    option.textContent = `${item.sku} - ${item.name}`;
    fragment.appendChild(option);
  });
  selectElement.appendChild(fragment);
}

function renderStockTable(state, filterTerm) {
  const tableBody = document.getElementById('stock-table-body');
  const empty = document.getElementById('stock-empty');
  const criticalList = document.getElementById('stock-critical-list');
  const movementSku = document.getElementById('movement-sku');
  if (!tableBody) return;

  const normalizedFilter = safeTrim(filterTerm, '').toLowerCase();
  const items = state.stock.items
    .slice()
    .sort((a, b) => a.sku.localeCompare(b.sku))
    .filter((item) => {
      if (!normalizedFilter) return true;
      return (
        item.sku.toLowerCase().includes(normalizedFilter) ||
        item.name.toLowerCase().includes(normalizedFilter)
      );
    });

  tableBody.innerHTML = '';
  if (items.length === 0) {
    if (empty) empty.hidden = false;
  } else if (empty) {
    empty.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const isCritical = Number(item.qty) <= Number(item.min);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.sku}</td>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.min}</td>
      <td class="${isCritical ? 'badge badge-critical' : 'badge badge-ok'}">
        ${isCritical ? 'Crítico' : 'Saudável'}
      </td>
    `;
    fragment.appendChild(row);
  });
  tableBody.appendChild(fragment);

  populateSkuOptions(state.stock.items, movementSku);

  if (criticalList) {
    const criticalItems = state.stock.items.filter((item) => Number(item.qty) <= Number(item.min));
    criticalList.innerHTML = '';
    const criticalFragment = document.createDocumentFragment();
    criticalItems.forEach((item) => {
      const badge = document.createElement('span');
      badge.className = 'tag tag-critical';
      badge.textContent = `${item.sku} (${item.qty}/${item.min})`;
      criticalFragment.appendChild(badge);
    });
    criticalList.appendChild(criticalFragment);
    if (criticalItems.length === 0) {
      criticalList.textContent = 'Nenhum item crítico no momento.';
    }
  }
}

export function initStockView({ store, toast }) {
  const itemForm = document.getElementById('stock-item-form');
  const movementForm = document.getElementById('stock-movement-form');
  const undoButton = document.getElementById('stock-undo-movement');
  const searchInput = document.getElementById('stock-search');

  if (!itemForm || !movementForm) return () => {};

  itemForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const sku = safeTrim(itemForm.elements.sku.value, '').toUpperCase();
    const name = safeTrim(itemForm.elements.name.value, '');

    if (!sku || !name) {
      toast.show('Informe SKU e nome válidos.', 'error');
      return;
    }

    store.upsertStockItem({
      sku,
      name,
      qty: parseInteger(itemForm.elements.qty.value, 0),
      min: parseInteger(itemForm.elements.min.value, 0),
    });

    toast.show(`Item ${sku} salvo com sucesso.`, 'success');
    itemForm.reset();
  });

  movementForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = store.applyStockMovement({
      sku: movementForm.elements.sku.value,
      type: movementForm.elements.movementType.value,
      qty: parseInteger(movementForm.elements.qty.value, 1),
    });

    toast.show(result.message, result.ok ? 'success' : 'error');
  });

  undoButton?.addEventListener('click', () => {
    const result = store.undoLastStockMovement();
    toast.show(result.message, result.ok ? 'info' : 'error');
  });

  searchInput?.addEventListener('input', () => {
    renderStockTable(store.getState(), searchInput.value);
  });

  return store.subscribe((state) => {
    renderStockTable(state, searchInput?.value || '');
  });
}

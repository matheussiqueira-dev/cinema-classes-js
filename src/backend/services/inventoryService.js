const { ensureNumber, ensureString } = require('../../core/validators');
const { NotFoundError, ValidationError } = require('../core/errors');
const { sanitizeValue } = require('../utils/sanitize');

class InventoryService {
  constructor({ db }) {
    this.db = db;
  }

  listItems() {
    return this.db.inventory.listarItens();
  }

  listCriticalItems() {
    return this.db.inventory.listarItensAbaixoDoMinimo();
  }

  getSummary() {
    return {
      totalItens: this.listItems().length,
      itensCriticos: this.listCriticalItems().length,
      valorTotalEstoque: this.db.inventory.valorTotalEstoque(),
    };
  }

  createItem(payload) {
    const input = sanitizeValue(payload || {});

    try {
      const created = this.db.inventory.cadastrarItem({
        sku: ensureString(input.sku, { label: 'SKU', maxLength: 40 }).toUpperCase(),
        nome: ensureString(input.nome, { label: 'Nome do item', maxLength: 120 }),
        quantidadeAtual: ensureNumber(input.quantidadeAtual || 0, {
          label: 'Quantidade atual',
          min: 0,
          integer: true,
        }),
        estoqueMinimo: ensureNumber(input.estoqueMinimo || 0, {
          label: 'Estoque minimo',
          min: 0,
          integer: true,
        }),
        custoUnitario: ensureNumber(input.custoUnitario || 0, {
          label: 'Custo unitario',
          min: 0,
        }),
        precoVenda: ensureNumber(input.precoVenda || 0, {
          label: 'Preco de venda',
          min: 0,
        }),
      });

      this.db.auditEvents.push({
        type: 'INVENTORY_ITEM_CREATED',
        sku: created.sku,
        occurredAt: new Date().toISOString(),
      });

      return created;
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }

  applyMovement(payload) {
    const input = sanitizeValue(payload || {});
    const sku = ensureString(input.sku, { label: 'SKU', maxLength: 40 }).toUpperCase();
    const tipo = ensureString(input.tipo, { label: 'Tipo de movimento', maxLength: 20 }).toLowerCase();
    const quantidade = ensureNumber(input.quantidade, {
      label: 'Quantidade',
      min: 1,
      integer: true,
    });

    try {
      const updated =
        tipo === 'entrada'
          ? this.db.inventory.registrarEntrada(sku, quantidade)
          : this.db.inventory.registrarSaida(sku, quantidade);

      this.db.auditEvents.push({
        type: 'INVENTORY_MOVEMENT',
        sku,
        movementType: tipo,
        quantidade,
        occurredAt: new Date().toISOString(),
      });

      return updated;
    } catch (error) {
      if (String(error.message).includes('nao encontrado')) {
        throw new NotFoundError(error.message);
      }
      throw new ValidationError(error.message);
    }
  }
}

module.exports = { InventoryService };

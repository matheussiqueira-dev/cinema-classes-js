const { randomUUID } = require('node:crypto');
const { Atendente, Gerente, Vendedor } = require('../../domain/usuarios');
const { ControleDeEstoque } = require('../../domain/estoque');

class InMemoryDatabase {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.inventory = new ControleDeEstoque();
    this.auditEvents = [];
    this.idempotencyRecords = new Map();
  }

  bootstrap() {
    this.#seedUsers();
    this.#seedInventory();
  }

  #seedUsers() {
    const gerente = new Gerente('Alice Manager', 'gerente@cinema.com', 'gerente123');
    const vendedor = new Vendedor('Bruno Sales', 'vendedor@cinema.com', 'vendedor123');
    const atendente = new Atendente('Carla Frontdesk', 'atendente@cinema.com', 'atendente123', 0);

    [gerente, vendedor, atendente].forEach((user) => {
      this.users.set(user.email, user);
    });
  }

  #seedInventory() {
    const items = [
      {
        sku: 'PIP-G',
        nome: 'Pipoca Grande',
        quantidadeAtual: 30,
        estoqueMinimo: 8,
        custoUnitario: 6,
        precoVenda: 18,
      },
      {
        sku: 'REF-L',
        nome: 'Refrigerante Lata',
        quantidadeAtual: 22,
        estoqueMinimo: 10,
        custoUnitario: 3.5,
        precoVenda: 11,
      },
      {
        sku: 'CHO-M',
        nome: 'Chocolate Mini',
        quantidadeAtual: 18,
        estoqueMinimo: 6,
        custoUnitario: 2,
        precoVenda: 8,
      },
    ];

    items.forEach((item) => {
      this.inventory.cadastrarItem(item);
    });
  }

  addAuditEvent(event) {
    const enriched = {
      id: randomUUID(),
      occurredAt: new Date().toISOString(),
      ...event,
    };
    this.auditEvents.push(enriched);

    if (this.auditEvents.length > 5000) {
      this.auditEvents.splice(0, this.auditEvents.length - 5000);
    }

    return enriched;
  }
}

module.exports = { InMemoryDatabase };

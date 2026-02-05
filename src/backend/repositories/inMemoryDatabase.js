const { Atendente, Gerente, Vendedor } = require('../../domain/usuarios');
const { ControleDeEstoque } = require('../../domain/estoque');

class InMemoryDatabase {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.inventory = new ControleDeEstoque();
    this.auditEvents = [];
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
}

module.exports = { InMemoryDatabase };

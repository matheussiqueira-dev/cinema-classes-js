// Hierarquia de usuários: Usuario (base), Gerente, Vendedor, Atendente

class Usuario {
  constructor(nome = '', email = '', senha = '') {
    this._nome = String(nome);
    this._email = String(email);
    this._senha = String(senha);
    this._isAdmin = false; // sobrescrito nas classes filhas quando necessário
  }

  get nome() {
    return this._nome;
  }
  set nome(n) {
    this._nome = String(n);
  }

  get email() {
    return this._email;
  }
  set email(e) {
    this._email = String(e);
  }

  // senha: só setter e método para alterá-la
  set senha(s) {
    this._senha = String(s);
  }

  checkSenha(s) {
    return this._senha === String(s);
  }

  isAdmin() {
    return Boolean(this._isAdmin);
  }

  // Métodos genéricos (podem ser sobrescritos)
  realizarLogin(email, senha) {
    if (this._email === email && this._senha === senha) {
      return true;
    }
    return false;
  }

  realizarLogoff() {
    return true;
  }

  alterarDados({ nome, email }) {
    if (typeof nome !== 'undefined') this.nome = nome;
    if (typeof email !== 'undefined') this.email = email;
    return true;
  }

  alterarSenha(senhaAtual, novaSenha) {
    if (this.checkSenha(senhaAtual)) {
      this.senha = novaSenha;
      return true;
    }
    return false;
  }
}

class Gerente extends Usuario {
  constructor(nome = '', email = '', senha = '') {
    super(nome, email, senha);
    this._isAdmin = true;
  }

  gerarRelatorioFinanceiro() {
    // Dummy: na prática retornaria dados reais
    return { receita: 0, despesas: 0, lucro: 0 };
  }

  consultarVendas() {
    // Dummy: retornaria vendas
    return [];
  }

  // reutiliza realizarLogin/logoff/alterarDados/alterarSenha da base
}

class Vendedor extends Usuario {
  constructor(nome = '', email = '', senha = '', quantidadeVendas = 0) {
    super(nome, email, senha);
    this._quantidadeVendas = Number(quantidadeVendas) || 0;
    this._isAdmin = false;
  }

  get quantidadeVendas() {
    return this._quantidadeVendas;
  }
  set quantidadeVendas(q) {
    this._quantidadeVendas = Number(q) || 0;
  }

  realizarVenda() {
    this._quantidadeVendas += 1;
    return this._quantidadeVendas;
  }

  consultarVendas() {
    return this._quantidadeVendas;
  }
}

class Atendente extends Usuario {
  constructor(nome = '', email = '', senha = '', valorEmCaixa = 0) {
    super(nome, email, senha);
    this._valorEmCaixa = Number(valorEmCaixa) || 0;
    this._isAdmin = false;
  }

  get valorEmCaixa() {
    return this._valorEmCaixa;
  }
  set valorEmCaixa(v) {
    const n = Number(v);
    if (Number.isNaN(n)) throw new Error('Valor inválido');
    this._valorEmCaixa = n;
  }

  receberPagamentos(valor) {
    const n = Number(valor);
    if (Number.isNaN(n)) throw new Error('Valor inválido');
    this._valorEmCaixa += n;
    return this._valorEmCaixa;
  }

  fecharCaixa() {
    const total = this._valorEmCaixa;
    this._valorEmCaixa = 0;
    return total;
  }
}

module.exports = { Usuario, Gerente, Vendedor, Atendente };

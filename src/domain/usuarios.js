const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const { ensureEmail, ensureNumber, ensureString } = require('../core/validators');

const MAX_TENTATIVAS_LOGIN = 5;
const TEMPO_BLOQUEIO_MS = 15 * 60 * 1000;

const PERMISSOES_POR_CARGO = {
  usuario: ['perfil:editar'],
  gerente: ['financeiro:visualizar', 'usuario:gerenciar', 'vendas:consultar'],
  vendedor: ['vendas:realizar', 'vendas:consultar'],
  atendente: ['caixa:operar', 'caixa:fechar'],
};

function hashSenhaComSalt(senha, salt) {
  return scryptSync(String(senha), salt, 64).toString('hex');
}

function normalizarEmailParaLogin(email) {
  return String(email || '').trim().toLowerCase();
}

class Usuario {
  constructor(nome = '', email = '', senha = '') {
    this.nome = nome;
    this.email = email;
    this._isAdmin = false;
    this._cargo = 'usuario';
    this._tentativasFalhas = 0;
    this._bloqueadoAte = null;
    this._ultimoLogin = null;
    this._permissoes = new Set(PERMISSOES_POR_CARGO.usuario);
    this.senha = senha;
  }

  get nome() {
    return this._nome;
  }

  set nome(valor) {
    this._nome = ensureString(valor, {
      label: 'Nome',
      allowEmpty: true,
      maxLength: 120,
    });
  }

  get email() {
    return this._email;
  }

  set email(valor) {
    this._email = ensureEmail(valor, {
      label: 'Email',
      allowEmpty: true,
    });
  }

  set senha(valor) {
    const senhaNormalizada = ensureString(valor, {
      label: 'Senha',
      allowEmpty: true,
      maxLength: 256,
    });
    this._salt = randomBytes(16).toString('hex');
    this._senhaHash = hashSenhaComSalt(senhaNormalizada, this._salt);
  }

  checkSenha(senhaInformada) {
    const hashInformado = hashSenhaComSalt(String(senhaInformada), this._salt);
    const hashAtualBuffer = Buffer.from(this._senhaHash, 'hex');
    const hashInformadoBuffer = Buffer.from(hashInformado, 'hex');
    return timingSafeEqual(hashAtualBuffer, hashInformadoBuffer);
  }

  isAdmin() {
    return Boolean(this._isAdmin);
  }

  get cargo() {
    return this._cargo;
  }

  estaBloqueado(agora = new Date()) {
    return this._bloqueadoAte instanceof Date && agora < this._bloqueadoAte;
  }

  realizarLogin(email, senha, agora = new Date()) {
    if (this.estaBloqueado(agora)) {
      return false;
    }

    const emailNormalizado = normalizarEmailParaLogin(email);
    const loginValido = this._email === emailNormalizado && this.checkSenha(senha);

    if (loginValido) {
      this._tentativasFalhas = 0;
      this._bloqueadoAte = null;
      this._ultimoLogin = new Date(agora);
      return true;
    }

    this._tentativasFalhas += 1;
    if (this._tentativasFalhas >= MAX_TENTATIVAS_LOGIN) {
      this._bloqueadoAte = new Date(agora.getTime() + TEMPO_BLOQUEIO_MS);
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
    if (!this.checkSenha(senhaAtual)) {
      return false;
    }
    this.senha = novaSenha;
    return true;
  }

  adicionarPermissao(permissao) {
    const permissaoValida = ensureString(permissao, {
      label: 'Permissao',
      allowEmpty: false,
      maxLength: 80,
    });
    this._permissoes.add(permissaoValida);
    return this;
  }

  removerPermissao(permissao) {
    this._permissoes.delete(String(permissao));
    return this;
  }

  temPermissao(permissao) {
    const permissaoValida = String(permissao || '').trim();
    if (!permissaoValida) return false;
    return this.isAdmin() || this._permissoes.has(permissaoValida);
  }

  consultarSeguranca() {
    return {
      tentativasFalhas: this._tentativasFalhas,
      bloqueado: this.estaBloqueado(),
      bloqueadoAte: this._bloqueadoAte,
      ultimoLogin: this._ultimoLogin,
    };
  }
}

class Gerente extends Usuario {
  constructor(nome = '', email = '', senha = '') {
    super(nome, email, senha);
    this._cargo = 'gerente';
    this._isAdmin = true;
    this._permissoes = new Set(PERMISSOES_POR_CARGO.gerente);
  }

  gerarRelatorioFinanceiro({ receita = 0, despesas = 0 } = {}) {
    const receitaNormalizada = ensureNumber(receita, { label: 'Receita', min: 0 });
    const despesasNormalizadas = ensureNumber(despesas, { label: 'Despesas', min: 0 });
    return {
      receita: receitaNormalizada,
      despesas: despesasNormalizadas,
      lucro: receitaNormalizada - despesasNormalizadas,
    };
  }

  consultarVendas(vendas = []) {
    if (!Array.isArray(vendas)) return [];
    return vendas.map((item) => ({
      id: item.id || '',
      total: Number(item.total || 0),
      assentos: Number(item.assentos || 0),
    }));
  }
}

class Vendedor extends Usuario {
  constructor(nome = '', email = '', senha = '', quantidadeVendas = 0) {
    super(nome, email, senha);
    this._cargo = 'vendedor';
    this._isAdmin = false;
    this._permissoes = new Set(PERMISSOES_POR_CARGO.vendedor);
    this.quantidadeVendas = quantidadeVendas;
    this._valorTotalVendido = 0;
  }

  get quantidadeVendas() {
    return this._quantidadeVendas;
  }

  set quantidadeVendas(valor) {
    this._quantidadeVendas = ensureNumber(valor, {
      label: 'Quantidade de vendas',
      min: 0,
      integer: true,
    });
  }

  realizarVenda(valorVenda = 0) {
    const valorNormalizado = ensureNumber(valorVenda, { label: 'Valor da venda', min: 0 });
    this._quantidadeVendas += 1;
    this._valorTotalVendido += valorNormalizado;
    return this._quantidadeVendas;
  }

  consultarVendas(detalhado = false) {
    if (!detalhado) {
      return this._quantidadeVendas;
    }

    return {
      quantidadeVendas: this._quantidadeVendas,
      valorTotalVendido: this._valorTotalVendido,
      ticketMedio:
        this._quantidadeVendas === 0 ? 0 : this._valorTotalVendido / this._quantidadeVendas,
    };
  }
}

class Atendente extends Usuario {
  constructor(nome = '', email = '', senha = '', valorEmCaixa = 0) {
    super(nome, email, senha);
    this._cargo = 'atendente';
    this._isAdmin = false;
    this._permissoes = new Set(PERMISSOES_POR_CARGO.atendente);
    this.valorEmCaixa = valorEmCaixa;
  }

  get valorEmCaixa() {
    return this._valorEmCaixa;
  }

  set valorEmCaixa(valor) {
    this._valorEmCaixa = ensureNumber(valor, { label: 'Valor em caixa', min: 0 });
  }

  receberPagamentos(valor) {
    const valorNormalizado = ensureNumber(valor, { label: 'Pagamento', min: 0 });
    this._valorEmCaixa += valorNormalizado;
    return this._valorEmCaixa;
  }

  registrarSangria(valor) {
    const valorNormalizado = ensureNumber(valor, { label: 'Sangria', min: 0 });
    if (valorNormalizado > this._valorEmCaixa) {
      throw new Error('Sangria maior que o valor disponivel em caixa');
    }
    this._valorEmCaixa -= valorNormalizado;
    return this._valorEmCaixa;
  }

  fecharCaixa(detalhado = false) {
    const totalFechamento = this._valorEmCaixa;
    this._valorEmCaixa = 0;

    if (!detalhado) {
      return totalFechamento;
    }

    return {
      totalFechamento,
      fechadoEm: new Date(),
    };
  }
}

module.exports = {
  Atendente,
  Gerente,
  Usuario,
  Vendedor,
};

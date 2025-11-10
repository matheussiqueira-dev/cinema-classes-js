// Implementação de relógios: Relogio (base), RelogioAmericano, RelogioBrasileiro

class Relogio {
  constructor(hora = 0, minuto = 0, segundo = 0) {
    this.setHora(hora);
    this.setMinuto(minuto);
    this.setSegundo(segundo);
  }

  getHora() {
    return this._hora;
  }
  getMinuto() {
    return this._minuto;
  }
  getSegundo() {
    return this._segundo;
  }

  setHora(h) {
    const n = Number(h);
    if (!Number.isInteger(n) || n < 0 || n > 23) throw new Error('Hora inválida (esperado 0-23)');
    this._hora = n;
  }

  setMinuto(m) {
    const n = Number(m);
    if (!Number.isInteger(n) || n < 0 || n > 59) throw new Error('Minuto inválido (0-59)');
    this._minuto = n;
  }

  setSegundo(s) {
    const n = Number(s);
    if (!Number.isInteger(n) || n < 0 || n > 59) throw new Error('Segundo inválido (0-59)');
    this._segundo = n;
  }

  pad2(n) {
    return String(n).padStart(2, '0');
  }

  horaFormatada() {
    return `${this.pad2(this._hora)}:${this.pad2(this._minuto)}:${this.pad2(this._segundo)}`;
  }

  // método que deve ser implementado nas classes filhas
  sincronizarCom(outroRelogio) {
    throw new Error('Método sincronizarCom deve ser implementado na subclasse');
  }
}

class RelogioBrasileiro extends Relogio {
  constructor(hora = 0, minuto = 0, segundo = 0) {
    super(hora, minuto, segundo);
  }

  // recebe outro relógio (qualquer implementação), extrai informações e aplica neste
  sincronizarCom(outroRelogio) {
    // espera que outroRelogio exponha getHora, getMinuto, getSegundo
    const h = outroRelogio.getHora();
    const m = outroRelogio.getMinuto();
    const s = outroRelogio.getSegundo();
    // aqui usamos as mesmas regras (0-23)
    this.setHora(h);
    this.setMinuto(m);
    this.setSegundo(s);
    return this;
  }
}

class RelogioAmericano extends Relogio {
  constructor(hora = 12, minuto = 0, segundo = 0) {
    // internamente mantenho horas no formato 1-12 válido para o americano
    super(0, minuto, segundo);
    // sete via método específico para validar 1-12
    this.setHoraAmericano(hora);
  }

  // override setHora para restringir a 1-12 quando chamado diretamente
  setHoraAmericano(h) {
    const n = Number(h);
    if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('Hora americana inválida (1-12)');
    this._hora = n;
  }

  // também ofereço getters compatíveis com base (getHora retorna 1-12)
  getHora() {
    return this._hora;
  }

  // sincroniza convertendo do relógio fonte (pode ser 0-23) para 1-12
  sincronizarCom(outroRelogio) {
    let h = outroRelogio.getHora();
    const m = outroRelogio.getMinuto();
    const s = outroRelogio.getSegundo();

    // convert 24h -> 12h (0 => 12)
    if (h === 0) h = 12;
    else if (h > 12) h = h - 12;

    this.setHoraAmericano(h);
    this.setMinuto(m);
    this.setSegundo(s);
    return this;
  }
}

module.exports = { Relogio, RelogioAmericano, RelogioBrasileiro };

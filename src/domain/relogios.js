const { ensureNumber } = require('../core/validators');

function validarHora24(valor) {
  return ensureNumber(valor, { label: 'Hora', integer: true, min: 0, max: 23 });
}

function validarHora12(valor) {
  return ensureNumber(valor, { label: 'Hora americana', integer: true, min: 1, max: 12 });
}

function validarMinutoSegundo(valor, label) {
  return ensureNumber(valor, { label, integer: true, min: 0, max: 59 });
}

function extrairTempoDoRelogio(outroRelogio) {
  if (!outroRelogio || typeof outroRelogio.getHora !== 'function') {
    throw new Error('Relogio de origem invalido para sincronizacao');
  }

  return {
    hora: outroRelogio.getHora(),
    minuto: outroRelogio.getMinuto(),
    segundo: outroRelogio.getSegundo(),
    periodo:
      typeof outroRelogio.getPeriodo === 'function' ? outroRelogio.getPeriodo() : undefined,
  };
}

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

  setHora(hora) {
    this._hora = validarHora24(hora);
  }

  setMinuto(minuto) {
    this._minuto = validarMinutoSegundo(minuto, 'Minuto');
  }

  setSegundo(segundo) {
    this._segundo = validarMinutoSegundo(segundo, 'Segundo');
  }

  pad2(valor) {
    return String(valor).padStart(2, '0');
  }

  horaFormatada() {
    return `${this.pad2(this._hora)}:${this.pad2(this._minuto)}:${this.pad2(this._segundo)}`;
  }

  avancarSegundos(segundos = 1) {
    const incremento = ensureNumber(segundos, {
      label: 'Incremento de segundos',
      integer: true,
      min: 0,
    });
    const totalSegundosAtuais = this._hora * 3600 + this._minuto * 60 + this._segundo;
    const totalAtualizado = (totalSegundosAtuais + incremento) % (24 * 3600);

    const hora = Math.floor(totalAtualizado / 3600);
    const minuto = Math.floor((totalAtualizado % 3600) / 60);
    const segundo = totalAtualizado % 60;

    this.setHora(hora);
    this.setMinuto(minuto);
    this.setSegundo(segundo);
    return this;
  }

  sincronizarCom() {
    throw new Error('Metodo sincronizarCom deve ser implementado na subclasse');
  }
}

class RelogioBrasileiro extends Relogio {
  sincronizarCom(outroRelogio) {
    const { hora, minuto, segundo, periodo } = extrairTempoDoRelogio(outroRelogio);
    let horaNormalizada = ensureNumber(hora, {
      label: 'Hora para sincronizacao',
      integer: true,
      min: 0,
      max: 23,
    });

    if (typeof periodo === 'string' && periodo.trim()) {
      const periodoNormalizado = periodo.trim().toUpperCase();
      if (periodoNormalizado === 'AM' && horaNormalizada === 12) {
        horaNormalizada = 0;
      }
      if (periodoNormalizado === 'PM' && horaNormalizada < 12) {
        horaNormalizada += 12;
      }
    }

    this.setHora(horaNormalizada);
    this.setMinuto(minuto);
    this.setSegundo(segundo);
    return this;
  }
}

class RelogioAmericano extends Relogio {
  constructor(hora = 12, minuto = 0, segundo = 0, periodo = 'AM') {
    super(0, minuto, segundo);
    this.setHoraAmericano(hora);
    this.setPeriodo(periodo);
  }

  setHoraAmericano(hora) {
    this._hora = validarHora12(hora);
  }

  setPeriodo(periodo) {
    const periodoNormalizado = String(periodo || '').trim().toUpperCase();
    if (periodoNormalizado !== 'AM' && periodoNormalizado !== 'PM') {
      throw new Error('Periodo americano invalido. Use AM ou PM');
    }
    this._periodo = periodoNormalizado;
  }

  getPeriodo() {
    return this._periodo;
  }

  getHora24() {
    if (this._periodo === 'AM') {
      return this._hora === 12 ? 0 : this._hora;
    }
    return this._hora === 12 ? 12 : this._hora + 12;
  }

  horaFormatadaCompleta() {
    return `${this.horaFormatada()} ${this._periodo}`;
  }

  sincronizarCom(outroRelogio) {
    const { hora, minuto, segundo, periodo } = extrairTempoDoRelogio(outroRelogio);
    const horaFonte = ensureNumber(hora, {
      label: 'Hora para sincronizacao',
      integer: true,
      min: 0,
      max: 23,
    });

    let horaAmericana;
    let periodoAmericano;

    if (typeof periodo === 'string' && periodo.trim()) {
      horaAmericana = horaFonte;
      periodoAmericano = periodo.trim().toUpperCase();
      if (periodoAmericano !== 'AM' && periodoAmericano !== 'PM') {
        throw new Error('Periodo americano invalido para sincronizacao');
      }
    } else {
      periodoAmericano = horaFonte >= 12 ? 'PM' : 'AM';
      if (horaFonte === 0) {
        horaAmericana = 12;
      } else if (horaFonte > 12) {
        horaAmericana = horaFonte - 12;
      } else {
        horaAmericana = horaFonte;
      }
    }

    this.setHoraAmericano(horaAmericana);
    this.setPeriodo(periodoAmericano);
    this.setMinuto(minuto);
    this.setSegundo(segundo);
    return this;
  }
}

module.exports = {
  Relogio,
  RelogioAmericano,
  RelogioBrasileiro,
};

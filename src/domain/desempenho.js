const { ensureArray, roundCurrency } = require('../core/validators');

class PainelDesempenho {
  static consolidarSessoes(sessoes = []) {
    const sessoesValidadas = ensureArray(sessoes, { label: 'Sessoes' });
    const consolidado = sessoesValidadas.reduce(
      (acc, sessao) => {
        const resumo = typeof sessao.resumoFinanceiro === 'function' ? sessao.resumoFinanceiro() : sessao;
        acc.receitaTotal += Number(resumo.receita || 0);
        acc.ingressosVendidos += Number(resumo.ingressosVendidos || 0);
        acc.capacidadeTotal += Number(resumo.capacidade || 0);
        return acc;
      },
      { receitaTotal: 0, ingressosVendidos: 0, capacidadeTotal: 0 }
    );

    const ocupacaoMedia =
      consolidado.capacidadeTotal === 0
        ? 0
        : (consolidado.ingressosVendidos / consolidado.capacidadeTotal) * 100;

    return {
      receitaTotal: roundCurrency(consolidado.receitaTotal),
      ingressosVendidos: consolidado.ingressosVendidos,
      capacidadeTotal: consolidado.capacidadeTotal,
      ocupacaoMedia: roundCurrency(ocupacaoMedia),
    };
  }

  static rankingVendedores(vendedores = []) {
    const vendedoresValidados = ensureArray(vendedores, { label: 'Vendedores' });
    return vendedoresValidados
      .map((vendedor) => ({
        nome: vendedor.nome || 'Sem nome',
        quantidadeVendas: vendedor.quantidadeVendas || 0,
        totalVendido:
          typeof vendedor.consultarVendas === 'function'
            ? Number(vendedor.consultarVendas(true).valorTotalVendido || 0)
            : 0,
      }))
      .sort((a, b) => b.totalVendido - a.totalVendido);
  }

  static gerarIndicadores({ sessoes = [], vendedores = [], itensEstoqueCriticos = 0 } = {}) {
    const resumoSessoes = this.consolidarSessoes(sessoes);
    const ranking = this.rankingVendedores(vendedores);

    return {
      operacao: resumoSessoes,
      vendas: {
        ranking,
        melhorVendedor: ranking[0] || null,
      },
      estoque: {
        itensCriticos: Number(itensEstoqueCriticos) || 0,
      },
    };
  }
}

module.exports = { PainelDesempenho };

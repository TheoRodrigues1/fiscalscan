/**
 * Parser simples de texto de nota fiscal brasileira.
 * Tenta extrair itens e valores usando heurísticas comuns.
 */
export function parsearNotaFiscal(texto) {
  const linhas = texto.split('\n').map((l) => l.trim()).filter((l) => l.length > 2);

  const itens = [];

  // Padrão: "PRODUTO    QTD    VL UNIT    TOTAL"
  // Ou: "PRODUTO    R$ 1,99"
  const regexValor = /(\d+[.,]\d{2})/g;
  const regexItem = /^(.+?)\s+(\d+[.,]\d{2})\s*$/;
  const regexItemCompleto = /^(.+?)\s+(\d+[\s,.]?\d*)\s+[xX*]\s*(\d+[.,]\d{2})\s+(\d+[.,]\d{2})/;

  for (const linha of linhas) {
    // Ignorar linhas que são cabeçalhos ou rodapés típicos
    if (/total|subtotal|troco|desconto|cpf|cnpj|data|hora|sat|nfc|nota|obrigado|fiscal|empresa|endere/i.test(linha) && !/\d{1,3},\d{2}/.test(linha)) {
      continue;
    }

    // Tentar padrão completo: nome qtd x preçoUnit total
    const matchCompleto = linha.match(regexItemCompleto);
    if (matchCompleto) {
      const nome = matchCompleto[1].trim();
      const total = parseFloat(matchCompleto[4].replace(',', '.'));
      if (nome.length > 1 && total > 0) {
        itens.push({ nome, valor: total });
        continue;
      }
    }

    // Padrão simples: nome + valor no final
    const matchSimples = linha.match(regexItem);
    if (matchSimples) {
      const nome = matchSimples[1].trim();
      const valor = parseFloat(matchSimples[2].replace(',', '.'));
      if (nome.length > 1 && valor > 0 && valor < 10000) {
        itens.push({ nome, valor });
        continue;
      }
    }

    // Última tentativa: linha com texto e ao menos um valor decimal
    const valores = linha.match(regexValor);
    if (valores && valores.length >= 1) {
      // Pegar o último valor (geralmente o total do item)
      const valorStr = valores[valores.length - 1];
      const valor = parseFloat(valorStr.replace(',', '.'));
      // Extrair nome removendo todos os números e símbolos do início/fim
      const nome = linha.replace(regexValor, '').replace(/[*xX]+/g, '').replace(/\s{2,}/g, ' ').trim();
      if (nome.length > 1 && valor > 0 && valor < 10000) {
        itens.push({ nome, valor });
      }
    }
  }

  // Remover duplicatas por nome similar
  const vistos = new Set();
  const unicos = itens.filter((item) => {
    const chave = item.nome.toLowerCase().substring(0, 10);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });

  const total = unicos.reduce((acc, i) => acc + i.valor, 0);
  return { itens: unicos, total };
}

export function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

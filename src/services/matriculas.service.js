const axios = require('axios');
const { parseCSV } = require('../utils/csvParser');
const DATA_SOURCES = require('../utils/dataSources');

const cache = {};

const fetchMatriculas = async (ano) => {
  if (cache[ano] && cache[ano].length === 0) {
    delete cache[ano];
  }

  if (cache[ano]) {
    console.log(`[cache] Retornando dados de ${ano} do cache`);
    return cache[ano];
  }

  const url = DATA_SOURCES[ano];
  if (!url) throw new Error(`Ano ${ano} não disponível`);

  console.log(`[fetch] Baixando dados de ${ano}...`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  const text = Buffer.from(response.data).toString('latin1');
  const records = await parseCSV(text);
  const normalized = normalizeRecords(records, ano);

  cache[ano] = normalized;
  return normalized;
};

const normalizeRecords = (records, ano) => {
  return records.map((row) => {
    const r = {};
    Object.keys(row).forEach(k => {
      r[k.replace(/"/g, '').trim()] = typeof row[k] === 'string'
        ? row[k].replace(/"/g, '').trim()
        : row[k];
    });

    return {
      ano: Number(r['ANO_LETIVO'] || ano),
      codigoEscola: r['COD'] || '',
      nomeEscola: toTitleCase(r['NOME_ESCOLA'] || ''),
      bairro: toTitleCase(r['BAIRRO'] || ''),
      distrito: r['RPA'] ? `RPA ${r['RPA']}` : 'Não informado',
      modalidade: r['MODALIDADE'] || '',
      nivelEnsino: r['ANOENSINO'] || '',
      turno: r['TURNO'] || '',
      totalMatriculas: 1,
    };
  });
};

const agruparPorEscola = (records) => {
  const mapa = {};

  records.forEach((r) => {
    const key = r.codigoEscola;
    if (!mapa[key]) {
      mapa[key] = {
        codigoEscola: r.codigoEscola,
        nomeEscola: r.nomeEscola,
        distrito: r.distrito,
        bairro: r.bairro,
        totalMatriculas: 0,
      };
    }
    mapa[key].totalMatriculas += r.totalMatriculas;
  });

  return Object.values(mapa).sort((a, b) => b.totalMatriculas - a.totalMatriculas);
};

const agruparPorDistrito = (records) => {
  const mapa = {};

  records.forEach((r) => {
    const key = r.distrito;
    if (!mapa[key]) mapa[key] = { distrito: key, totalMatriculas: 0 };
    mapa[key].totalMatriculas += r.totalMatriculas;
  });

  return Object.values(mapa).sort((a, b) => b.totalMatriculas - a.totalMatriculas);
};

const evolucaoAnual = async () => {
  const anos = Object.keys(DATA_SOURCES).map(Number).sort();
  const resultado = [];

  for (const ano of anos) {
    try {
      const records = await fetchMatriculas(ano);
      const total = records.reduce((sum, r) => sum + r.totalMatriculas, 0);
      resultado.push({ ano, totalMatriculas: total });
    } catch (err) {
      console.error(`Erro ao buscar ${ano}:`, err.message);
    }
  }

  return resultado;
};

const toTitleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

module.exports = {
  fetchMatriculas,
  agruparPorEscola,
  agruparPorDistrito,
  evolucaoAnual,
};
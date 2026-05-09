const axios = require('axios');
const { parseCSV } = require('../utils/csvParser');
const DATA_SOURCES = require('../utils/dataSources');

const cache = {};

const corrigirEncoding = (str) => {
  if (!str) return '';
  return str
    .replace(/Ã\x83/g, 'Ã')
    .replace(/Ã\x87/g, 'Ç')
    .replace(/Ã\x89/g, 'É')
    .replace(/Ã\x8d/g, 'Í')
    .replace(/Ã\x93/g, 'Ó')
    .replace(/Ã\x9a/g, 'Ú')
    .replace(/Ã\x9c/g, 'Ü')
    .replace(/Ã\xa3/g, 'ã')
    .replace(/Ã\xa7/g, 'ç')
    .replace(/Ã\xa9/g, 'é')
    .replace(/Ã\xad/g, 'í')
    .replace(/Ã\xb3/g, 'ó')
    .replace(/Ã\xba/g, 'ú')
    .replace(/Ã\xb5/g, 'õ')
    .replace(/Ã\x95/g, 'Õ')
    .replace(/Ã\xa2/g, 'â')
    .replace(/Ã\x82/g, 'Â')
    .replace(/Ã\xb1/g, 'ñ')
    .replace(/Ã£/g, 'ã')
    .replace(/Ãƒ/g, 'Ã')
    .replace(/\xc3\xa3/g, 'ã')
    .replace(/\xc3\xa9/g, 'é')
    .replace(/\xc3\xb5/g, 'õ')
    .replace(/\xc3\xa7/g, 'ç');
};

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
    Object.keys(row).forEach((k) => {
      r[k.replace(/"/g, '').trim()] =
        typeof row[k] === 'string' ? row[k].replace(/"/g, '').trim() : row[k];
    });

    return {
      ano: Number(r['ANO_LETIVO'] || ano),
      codigoEscola: r['COD'] || '',
      nomeEscola: toTitleCase(corrigirEncoding(r['NOME_ESCOLA'] || '')),
      bairro: toTitleCase(corrigirEncoding(r['BAIRRO'] || '')),
      endereco: toTitleCase(corrigirEncoding(r['ENDERECO'] || '')),
      numero: r['NUMERO'] || 'S/N',
      distrito: r['RPA'] ? `RPA ${r['RPA']}` : 'Não informado',
      modalidade: corrigirEncoding(r['MODALIDADE'] || ''),
      nivelEnsino: corrigirEncoding(r['ANOENSINO'] || ''),
      turno: corrigirEncoding(r['TURNO'] || ''),
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
        bairro: r.bairro,
        endereco: r.endereco,
        numero: r.numero,
        distrito: r.distrito,
        totalMatriculas: 0,
        turnos: {},
        modalidades: {},
      };
    }

    mapa[key].totalMatriculas += 1;

    const turno = r.turno || 'Não informado';
    mapa[key].turnos[turno] = (mapa[key].turnos[turno] || 0) + 1;

    const modalidade = r.modalidade || 'Não informado';
    mapa[key].modalidades[modalidade] =
      (mapa[key].modalidades[modalidade] || 0) + 1;
  });

  return Object.values(mapa)
    .map((escola) => ({
      ...escola,
      turnos: Object.entries(escola.turnos)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total),
      modalidades: Object.entries(escola.modalidades)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total),
    }))
    .sort((a, b) => b.totalMatriculas - a.totalMatriculas);
};

const agruparPorDistrito = (records) => {
  const mapa = {};

  records.forEach((r) => {
    const key = r.distrito;
    if (!mapa[key]) mapa[key] = { distrito: key, totalMatriculas: 0 };
    mapa[key].totalMatriculas += r.totalMatriculas;
  });

  return Object.values(mapa).sort(
    (a, b) => b.totalMatriculas - a.totalMatriculas
  );
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
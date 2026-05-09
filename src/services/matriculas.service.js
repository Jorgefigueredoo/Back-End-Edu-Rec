const axios = require('axios');
const { parseCSV } = require('../utils/csvParser');
const DATA_SOURCES = require('../utils/dataSources');

// Cache simples em memória para não bater na API pública a cada requisição
const cache = {};

/**
 * Busca e parseia o CSV de um ano específico.
 * Mantém cache para evitar downloads repetidos.
 */
const fetchMatriculas = async (ano) => {
  if (cache[ano]) {
    console.log(`[cache] Retornando dados de ${ano} do cache`);
    return cache[ano];
  }

  const url = DATA_SOURCES[ano];
  if (!url) throw new Error(`Ano ${ano} não disponível`);

  console.log(`[fetch] Baixando dados de ${ano}...`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  // O CSV do Recife vem em latin1 — precisamos converter para UTF-8
  const text = Buffer.from(response.data).toString('latin1');

  const records = await parseCSV(text);
  const normalized = normalizeRecords(records, ano);

  cache[ano] = normalized;
  return normalized;
};

/**
 * Normaliza os campos brutos do CSV para um formato limpo e consistente.
 * Adaptar os nomes das colunas conforme o CSV real após inspecionar.
 */
const normalizeRecords = (records, ano) => {
  return records.map((row) => ({
    ano: Number(ano),
    codigoEscola: row['CO_ENTIDADE'] || row['co_entidade'] || '',
    nomeEscola: toTitleCase(row['NO_ENTIDADE'] || row['no_entidade'] || ''),
    distrito: row['NO_DISTRITO'] || row['no_distrito'] || row['DS_DISTRITO'] || 'Não informado',
    bairro: row['NO_BAIRRO'] || row['no_bairro'] || '',
    nivelEnsino: row['DS_ETAPA'] || row['ds_etapa'] || row['NO_ETAPA_ENSINO'] || '',
    turno: row['DS_TURNO'] || row['ds_turno'] || '',
    totalMatriculas: Number(row['QT_MAT_BAS'] || row['qt_mat_bas'] || row['QT_MATRICULAS'] || 0),
  }));
};

/**
 * Agrupa matrículas por escola somando todos os níveis e turnos.
 */
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

/**
 * Agrupa matrículas por distrito.
 */
const agruparPorDistrito = (records) => {
  const mapa = {};

  records.forEach((r) => {
    const key = r.distrito;
    if (!mapa[key]) mapa[key] = { distrito: key, totalMatriculas: 0 };
    mapa[key].totalMatriculas += r.totalMatriculas;
  });

  return Object.values(mapa).sort((a, b) => b.totalMatriculas - a.totalMatriculas);
};

/**
 * Retorna o total de matrículas por ano (para o gráfico de evolução).
 */
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

// Utilitário: converte "ESCOLA MUNICIPAL FULANO" → "Escola Municipal Fulano"
const toTitleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

module.exports = {
  fetchMatriculas,
  agruparPorEscola,
  agruparPorDistrito,
  evolucaoAnual,
};

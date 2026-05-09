const {
  fetchMatriculas,
  agruparPorEscola,
  agruparPorDistrito,
  evolucaoAnual,
} = require('../services/matriculas.service');

/**
 * GET /api/matriculas/escolas?ano=2024&distrito=Norte
 * Lista escolas com total de matrículas, com filtros opcionais.
 */
const getEscolas = async (req, res) => {
  try {
    const ano = Number(req.query.ano) || 2024;
    const { distrito, busca } = req.query;

    const records = await fetchMatriculas(ano);
    let escolas = agruparPorEscola(records);

    if (distrito) {
      escolas = escolas.filter((e) =>
        e.distrito.toLowerCase().includes(distrito.toLowerCase())
      );
    }

    if (busca) {
      escolas = escolas.filter((e) =>
        e.nomeEscola.toLowerCase().includes(busca.toLowerCase())
      );
    }

    res.json({
      ano,
      total: escolas.length,
      data: escolas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/matriculas/distritos?ano=2024
 * Retorna total de matrículas agrupado por distrito.
 */
const getDistritos = async (req, res) => {
  try {
    const ano = Number(req.query.ano) || 2024;
    const records = await fetchMatriculas(ano);
    const distritos = agruparPorDistrito(records);

    res.json({ ano, data: distritos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/matriculas/evolucao
 * Retorna total de matrículas por ano (2020–2024).
 */
const getEvolucao = async (req, res) => {
  try {
    const data = await evolucaoAnual();
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/matriculas/resumo?ano=2024
 * Retorna os KPIs principais para os cards do dashboard.
 */
const getResumo = async (req, res) => {
  try {
    const ano = Number(req.query.ano) || 2024;
    const records = await fetchMatriculas(ano);
    const escolas = agruparPorEscola(records);

    const totalMatriculas = escolas.reduce((s, e) => s + e.totalMatriculas, 0);
    const totalEscolas = escolas.length;
    const mediaAlunos = totalEscolas > 0 ? Math.round(totalMatriculas / totalEscolas) : 0;

    res.json({
      ano,
      totalEscolas,
      totalMatriculas,
      mediaAlunos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEscolas, getDistritos, getEvolucao, getResumo };

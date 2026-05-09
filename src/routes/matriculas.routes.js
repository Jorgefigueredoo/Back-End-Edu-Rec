const { Router } = require('express');
const {
  getEscolas,
  getDistritos,
  getEvolucao,
  getResumo,
} = require('../controllers/matriculas.controller');

const router = Router();

// GET /api/matriculas/resumo?ano=2024
router.get('/resumo', getResumo);

// GET /api/matriculas/escolas?ano=2024&distrito=Norte&busca=nome
router.get('/escolas', getEscolas);

// GET /api/matriculas/distritos?ano=2024
router.get('/distritos', getDistritos);

// GET /api/matriculas/evolucao
router.get('/evolucao', getEvolucao);

module.exports = router;

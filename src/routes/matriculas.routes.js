const { Router } = require('express');
const {
  getEscolas,
  getDistritos,
  getEvolucao,
  getResumo,
} = require('../controllers/matriculas.controller');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Matrículas
 *   description: Dados de matrículas escolares do município do Recife
 */

/**
 * @swagger
 * /api/matriculas/resumo:
 *   get:
 *     summary: KPIs do dashboard
 *     tags: [Matrículas]
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema:
 *           type: integer
 *           example: 2024
 *         description: Ano de referência (2020–2024)
 *     responses:
 *       200:
 *         description: Resumo com total de escolas, matrículas e média por escola
 *         content:
 *           application/json:
 *             example:
 *               ano: 2024
 *               totalEscolas: 312
 *               totalMatriculas: 148500
 *               mediaAlunos: 476
 */
router.get('/resumo', getResumo);

/**
 * @swagger
 * /api/matriculas/escolas:
 *   get:
 *     summary: Lista de escolas com total de matrículas
 *     tags: [Matrículas]
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema:
 *           type: integer
 *           example: 2024
 *       - in: query
 *         name: distrito
 *         schema:
 *           type: string
 *           example: Norte
 *         description: Filtra por nome do distrito
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *           example: Paulo Freire
 *         description: Busca pelo nome da escola
 *     responses:
 *       200:
 *         description: Lista de escolas filtradas
 *         content:
 *           application/json:
 *             example:
 *               ano: 2024
 *               total: 1
 *               data:
 *                 - codigoEscola: "26097458"
 *                   nomeEscola: "Escola Municipal Paulo Freire"
 *                   distrito: "Norte"
 *                   bairro: "Casa Amarela"
 *                   totalMatriculas: 842
 */
router.get('/escolas', getEscolas);

/**
 * @swagger
 * /api/matriculas/distritos:
 *   get:
 *     summary: Matrículas agrupadas por distrito
 *     tags: [Matrículas]
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema:
 *           type: integer
 *           example: 2024
 *     responses:
 *       200:
 *         description: Total de matrículas por distrito, ordenado do maior para o menor
 *         content:
 *           application/json:
 *             example:
 *               ano: 2024
 *               data:
 *                 - distrito: "Norte"
 *                   totalMatriculas: 87420
 *                 - distrito: "Sul"
 *                   totalMatriculas: 68900
 */
router.get('/distritos', getDistritos);

/**
 * @swagger
 * /api/matriculas/evolucao:
 *   get:
 *     summary: Evolução anual de matrículas (2020–2024)
 *     tags: [Matrículas]
 *     responses:
 *       200:
 *         description: Total de matrículas por ano para o gráfico de linha
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - ano: 2020
 *                   totalMatriculas: 132000
 *                 - ano: 2024
 *                   totalMatriculas: 148500
 */
router.get('/evolucao', getEvolucao);

module.exports = router;
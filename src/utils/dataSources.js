// URLs dos CSVs oficiais — Portal de Dados Abertos do Recife
// Fonte: https://dados.recife.pe.gov.br/dataset/alunos-matriculados-2023

const BASE_URL = 'https://dados.recife.pe.gov.br:443/dataset/0384775d-d187-4cf7-aa64-102c95c139de/resource';

const DATA_SOURCES = {
  2024: `${BASE_URL}/326b7fb6-90af-46d9-b342-a9c8fa6a706c/download/matriculas-na-rede-municipal-do-ano-de-2024.csv`,
  2023: `${BASE_URL}/0979b5c0-79ee-4a72-a1fe-947b5d9efa2b/download/matriculas-na-rede-municipal-do-ano-de-2023.csv`,
  2022: `${BASE_URL}/95b6233d-db5b-40cf-afdd-116d4b24da28/download/matriculas-na-rede-municipal-do-ano-de-2022.csv`,
  2021: `${BASE_URL}/afb4f83f-9b0a-4f2a-9a94-cebdc10c847b/download/matriculas-na-rede-municipal-do-ano-de-2021.csv`,
  2020: `${BASE_URL}/9d25cd6a-43f3-4789-81c6-5d88fec9c8cd/download/matriculas-na-rede-municipal-do-ano-de-2020.csv`,
};

module.exports = DATA_SOURCES;

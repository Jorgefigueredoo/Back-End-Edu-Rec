require('dotenv').config();
const app = require('./app');
const { fetchMatriculas } = require('./services/matriculas.service');

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  
  // Pré-carrega o cache do ano mais recente ao subir
  console.log('⏳ Pré-carregando cache de 2024...');
  try {
    await fetchMatriculas(2024);
    console.log('✅ Cache de 2024 pronto!');
  } catch (err) {
    console.error('Erro ao pré-carregar cache:', err.message);
  }
});
const { parse } = require('csv-parse');

/**
 * Recebe o texto bruto do CSV e retorna array de objetos
 */
const parseCSV = (rawText) => {
  return new Promise((resolve, reject) => {
    parse(rawText, {
      columns: true,          // primeira linha vira chave dos objetos
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',         // CSVs do Recife usam ponto e vírgula
    }, (err, records) => {
      if (err) return reject(err);
      resolve(records);
    });
  });
};

module.exports = { parseCSV };

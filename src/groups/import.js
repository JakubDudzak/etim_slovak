const ADODB = require('node-adodb');
const fs = require('fs');
const ProgressBar = require('progress');
const config = require('./config.json');

const connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${config.databasePath};`)

fs.readFile(config.inputFile, 'utf8', async (err, data) => {
  if (err) {
    console.error('Failed to read file', err);
    return;
  }

  let lines = data.split('\n');
  let bar = new ProgressBar('Processing [:bar] :percent :etas', { total: lines.length });

  for (let line of lines) {
    let [original, translated] = line.split('___');

    // Skip lines that do not have a comma or do not have a translation
    if (!original || !translated) {
        console.log(`Skipping invalid line: ${line}`);
        continue;
    }

    try {
      let escapedOriginal = original.replace(/'/g, "''");
      let escapedTranslated = translated.replace(/'/g, "''");

      await connection.execute(`UPDATE ${config.tableName} SET ${config.propertyName} = '${escapedTranslated.trim()}' WHERE ${config.propertyName} = '${escapedOriginal.trim()}'`);

      bar.tick();
      if (bar.complete) {
        console.log('\nDone processing lines\n');
      }
    } catch (error) {
      console.error(`Error processing line: `, error);
    }
  }
});

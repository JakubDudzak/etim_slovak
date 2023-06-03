const config = require('./config.json');
const ADODB = require('node-adodb');
const fs = require('fs');
const connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${config.databasePath};`);

let writeStream = fs.createWriteStream(config.originalFile);
let translatedStream = fs.createWriteStream(config.translatedFile);

let lineCount = 0;

connection
  .query('SELECT GROUPDESC FROM ETIMARTGROUP')
  .then(data => {
    for (let item of data) {
      writeStream.write(item.GROUPDESC + '\n');
      translatedStream.write(item.GROUPDESC + '\n');
      lineCount++;

      if (lineCount % 100 === 0) {
        for (let i = 0; i < 20; i++) {
          translatedStream.write('\n');
        }
      }
    }

    writeStream.end();
    translatedStream.end();

    console.log(`Data successfully written to ${config.originalFile}`);
    console.log(`Translated data successfully written to ${config.translatedFile}`);
  })
  .catch(error => {
    console.error(error);
  });

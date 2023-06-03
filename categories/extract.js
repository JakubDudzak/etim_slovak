const config = require('./config.json');
const ADODB = require('node-adodb');
const fs = require('fs');
const connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${config.databasePath};`)

let writeStream = fs.createWriteStream(config.originalFile);

connection
  .query('SELECT GROUPDESC FROM ETIMARTGROUP')
  .then(data => {
    for (let item of data) {
      writeStream.write(item.GROUPDESC + '\n');
    }
    writeStream.end();
    console.log(`Data successfully written to ${config.originalFile}`);
  })
  .catch(error => {
    console.error(error);
  });

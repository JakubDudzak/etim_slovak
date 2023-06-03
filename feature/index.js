const config = require('./config.json');
const ADODB = require('node-adodb');
const fs = require('fs');
const DeepL = require('node-deepl');

const connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${config.databasePath};`);
const deepl = new DeepL(config.deepLApiKey);

let writeStream = fs.createWriteStream(config.originalFile);
let translatedStream = fs.createWriteStream(config.translatedFile);

let lineCount = 0;
let textsToTranslate = [];

connection
  .query(`SELECT FEATUREDESC FROM ETIMFEATURE`)
  .then(data => {
    for (let item of data) {
      const originalText = item.FEATUREDESC;
      writeStream.write(originalText + '\n');
      lineCount++;

      textsToTranslate.push(originalText);

      // Once we reach 100 lines, translate them and clear the array
      if (textsToTranslate.length === 100) {
        translateAndWrite(textsToTranslate);
        textsToTranslate = [];
      }
    }

    // If there are any remaining texts to translate, translate them now
    if (textsToTranslate.length > 0) {
      translateAndWrite(textsToTranslate);
    }

    writeStream.end();
    console.log(`Data successfully written to ${config.originalFile}`);
  })
  .catch(error => {
    console.error(error);
  });

// This function handles translating and writing the translated text to a file
function translateAndWrite(texts) {
  // Translate the text using DeepL API
  deepl.translate(texts.join('\n'), 'EN', 'SK')
    .then(res => {
      if (res.data && res.data.translations && res.data.translations.length > 0) {
        translatedStream.write(res.data.translations[0].text + '\n');
      }
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      translatedStream.end();
      console.log(`Translated data successfully written to ${config.translatedFile}`);
    });
}

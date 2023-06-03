const config = require('./config.json');
const fs = require('fs');
const DeepL = require('deepl-node');
require('dotenv').config();
const {DEEPL_API_KEY: deepLApiKey} = process.env;


const deepl = new DeepL.Translator(config.deepLApiKey);

let translatedStream = fs.createWriteStream(config.translatedFile);

// Read the content from the originalFile
fs.readFile(config.originalFile, 'utf-8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const textsToTranslate = data.trim().split('\n');

  // This function handles translating and writing the translated text to a file
  function translateAndWrite(texts) {
    // Translate the text using DeepL API
    deepl.translateText(texts.join('\n'), 'EN', 'SK')
      .then(res => {
        console.log(res.text);
        translatedStream.write(res.text + '\n');
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        if (textsToTranslate.length === 0) {
          translatedStream.end();
          console.log(`Translated data successfully written to ${config.translatedFile}`);
        } else {
          translateAndWrite(textsToTranslate.splice(0, 100));
        }
      });
  }

  // Start translating the texts
  translateAndWrite(textsToTranslate.splice(0, 100));
});

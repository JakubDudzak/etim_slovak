const fs = require('fs');
const DeepL = require('deepl-node');
const { log } = require('console');
require('dotenv').config({ path: '../.env' });
const { DEEPL_API_KEY: deepLApiKey } = process.env;

const config = require('./config.json');
const deepl = new DeepL.Translator(deepLApiKey);

// Check command-line arguments
const args = process.argv.slice(2);
const translateMode = args.includes('--translate');
const mergeMode = args.includes('--merge');

if (translateMode) {
  const translatedStream = fs.createWriteStream(config.translatedFile);

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
}

if (mergeMode) {
  function mergeFiles(firstFile, secondFile, outputFile) {
    const firstStream = fs.createReadStream(firstFile, { encoding: 'utf-8' });
    const secondStream = fs.createReadStream(secondFile, { encoding: 'utf-8' });
    const outputStream = fs.createWriteStream(outputFile, { encoding: 'utf-8' });

    firstStream.on('data', (data1) => {
      secondStream.once('data', (data2) => {
        const lines1 = data1.trim().split('\n');
        const lines2 = data2.trim().split('\n');
        const mergedLines = [];

        for (let i = 0; i < lines1.length && i < lines2.length; i++) {
          mergedLines.push(`${lines1[i].trim()}___${lines2[i].trim()}`);
        }

        outputStream.write(mergedLines.join('\n'));
        outputStream.end();
      });
    });
  }

  mergeFiles(config.originalFile, config.translatedFile, config.inputFile);
}

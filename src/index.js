const ADODB = require('node-adodb');
const fs = require('fs');
const ProgressBar = require('progress');
const path = require('path');
const DeepL = require('deepl-node');
require('dotenv').config();

const {
  DEEPL_API_KEY: deepLApiKey,
  DATABASE_PATH: databasePath,
  TRANSLATED_FILE: translatedFile,
  ORIGINAL_FILE: originalFile,
  INPUT_FILE: inputFile,
} = process.env;

const args = process.argv.slice(2);
const workingDirectory = args[0];

if (!workingDirectory) {
  console.error('Please provide the path to the valid directory');
  process.exit(1);
}

const config = require(path.resolve(workingDirectory, 'config.json'));
const deepl = new DeepL.Translator(deepLApiKey);

// Check command-line arguments
const translateMode = args.includes('--translate') || args.includes('-all');
const mergeMode = args.includes('--merge') || args.includes('-all');
const updateMode = args.includes('--update') || args.includes('-all');


if (translateMode) {
  const translatedStream = fs.createWriteStream(path.resolve(workingDirectory, translatedFile));

  // Read the content from the originalFile
  fs.readFile(path.resolve(workingDirectory, originalFile), 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const textsToTranslate = data.trim().split('\n');

    // This function handles translating and writing the translated text to a file
    function translateAndWrite(texts) {
      // Translate the text using DeepL API
      deepl
        .translateText(texts.join('\n'), 'EN', 'SK')
        .then((res) => {
          console.log(res.text);
          translatedStream.write(res.text + '\n');
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          if (textsToTranslate.length === 0) {
            translatedStream.end();
            console.log(`Translated data successfully written to ${translatedFile}`);
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
    const firstStream = fs.createReadStream(path.resolve(workingDirectory, firstFile), { encoding: 'utf-8' });
    const secondStream = fs.createReadStream(path.resolve(workingDirectory, secondFile), { encoding: 'utf-8' });
    const outputStream = fs.createWriteStream(path.resolve(workingDirectory, outputFile), { encoding: 'utf-8' });

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

  mergeFiles(originalFile, translatedFile, inputFile);
}

if(updateMode){
    const connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${path.resolve(workingDirectory, databasePath)};`)

    fs.readFile(path.resolve(workingDirectory, inputFile), 'utf8', async (err, data) => {
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
}
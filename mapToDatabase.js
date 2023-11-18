const sqlite3 = require("sqlite3");
const fs = require("fs");

function extractUniqueWords(message) {
  const words = message.match(/\b[a-zA-Z]{2,}\b/g) || [];
  return new Set(words.map((word) => word.toUpperCase()));
}

function createWordLogIdMapping(dbPath = "log_data.db", callback) {
  const dbExists = fs.existsSync(dbPath);
  if (!dbExists) {
    console.error(`Database not found at path: ${dbPath}`);
    return;
  }

  const db = new sqlite3.Database(dbPath);
  const wordLogIdMapping = {};

  db.each("SELECT rowid, message FROM logs", (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }

    const uniqueWords = extractUniqueWords(row.message);

    uniqueWords.forEach((word) => {
      if (word in wordLogIdMapping) {
        wordLogIdMapping[word].add(row.rowid);
      } else {
        wordLogIdMapping[word] = new Set([row.rowid]);
      }
    });
  }, () => {
    // Call the callback function after all rows have been processed
    callback(wordLogIdMapping);
    db.close();
  });
}

function saveMappingToDatabase(data, dbPath = "log_data.db") {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS word_logid_mapping (
        word TEXT PRIMARY KEY,
        log_ids TEXT
      )
    `, (err) => {
      if (err) {
        console.error(err.message);
        return;
      }

      const insertOrUpdate = db.prepare(`
        INSERT OR REPLACE INTO word_logid_mapping (word, log_ids) VALUES (?, ?)
      `);

      let insertCount = 0;
      const totalInserts = Object.keys(data).length;

      Object.entries(data).forEach(([word, logIds]) => {
        const jsonLogIds = JSON.stringify(Array.from(logIds));
        insertOrUpdate.run(word, jsonLogIds, (err) => {
          if (err) {
            console.error(err.message);
          }

          insertCount++;
          if (insertCount === totalInserts) {
            insertOrUpdate.finalize(() => {
              db.close();
            });
          }
        });
      });

      if (totalInserts === 0) {
        insertOrUpdate.finalize(() => {
          db.close();
        });
      }
    });
  });
}

function createUniqueWordsFile(wordLogIdMapping) {
  const uniqueWords = Object.keys(wordLogIdMapping);
  fs.writeFileSync("uniqueWords.txt", uniqueWords.join("\n"));
}

// Run the function and save the dictionary to the existing database
createWordLogIdMapping("log_data.db", (wordLogIdMapping) => {
  saveMappingToDatabase(wordLogIdMapping);
  createUniqueWordsFile(wordLogIdMapping);
  console.log(`Word-logID mapping and unique words list saved.`);
});

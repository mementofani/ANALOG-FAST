const sqlite3 = require("sqlite3");
const fs = require("fs");

function extractUniqueWords(message) {
  const words = message.match(/\b[a-zA-Z]{2,}\b/g) || [];
  return new Set(words.map((word) => word.toUpperCase()));
}

function createWordLogIdMapping(dbPath = "log_data.db") {
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
  });

  db.close();
  return wordLogIdMapping;
}

function saveMappingToDatabase(data, dbPath = "log_data.db") {
  const db = new sqlite3.Database(dbPath);

  db.run(`
        CREATE TABLE IF NOT EXISTS word_logid_mapping (
            word TEXT PRIMARY KEY,
            log_ids TEXT
        )
    `);

  const insertOrUpdate = db.prepare(`
        INSERT OR REPLACE INTO word_logid_mapping (word, log_ids) VALUES (?, ?)
    `);

  Object.entries(data).forEach(([word, logIds]) => {
    const jsonLogIds = JSON.stringify(Array.from(logIds));
    insertOrUpdate.run(word, jsonLogIds);
  });

  console.log(Object.keys(data));

  insertOrUpdate.finalize();
  db.close();
}

// Run the function and save the dictionary to the existing database
const wordLogIdMapping = createWordLogIdMapping();
saveMappingToDatabase(wordLogIdMapping);

console.log(`Word-logID mapping saved to the existing database 'log_data.db'`);

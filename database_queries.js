const sqlite3 = require("sqlite3").verbose();

// Connect to the database
let db = new sqlite3.Database("log_data.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

let completed = false;

// Function to execute a single query
function executeQuery(sql) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let results = [];
      db.each(
        sql,
        (err, row) => {
          if (err) {
            reject(err.message);
            return;
          }
          results.push(row);
        },
        (err) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(results);
          }
        }
      );
    });
  });
}

async function query(sql) {
  try {
    return await executeQuery(sql);
  } catch (er) {
    return { error: er.message };
  }
}

module.exports.query = query;

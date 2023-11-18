const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

// Regular expression pattern
const logPattern = /(\w+\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.*)/;

function parseLogLine(line) {
  const match = logPattern.exec(line);
  return match ? match.slice(1) : null;
}

function processLogFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split("\n");
  return lines
    .map((line, index) => {
      const parsedLine = parseLogLine(line);
      if (parsedLine === null) {
        console.log(`Failed to parse line ${index + 1}: ${line}`);
      }
      return parsedLine;
    })
    .filter((result) => result !== null);
}

function saveToDatabase(data, dbPath = "log_data.db") {
  const db = new sqlite3.Database(dbPath);

  // Create table
  db.run(`CREATE TABLE IF NOT EXISTS logs
          (time TEXT, layer_source TEXT, message TEXT)`);

  // Insert data
  const stmt = db.prepare("INSERT INTO logs VALUES (?, ?, ?)");
  data.forEach((row) => stmt.run(row));
  stmt.finalize();

  db.close();
}

// Example usage
const logFilePath = "test";
const parsedData = processLogFile(logFilePath);
saveToDatabase(parsedData);

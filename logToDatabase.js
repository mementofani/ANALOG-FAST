const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

// Regular expression pattern
const logPattern = /(\w+\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.*)/;

function parseLogLine(line, lineNumber) {
  if (!line.trim()) {
    console.log(`Skipped empty line ${lineNumber}`);
    return null;
  }

  const match = logPattern.exec(line);
  if (!match) {
    console.log(`Failed to parse line ${lineNumber}: Invalid format - ${line}`);
    return null;
  }

  return match.slice(1);
}

function processLogFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split("\n");

  return lines
    .map((line, index) => {
      const parsedLine = parseLogLine(line, index + 1);
      if (parsedLine === null) {
        console.log(`Failed to parse line ${index + 1}: ${line}`);
      }
      return parsedLine;
    })
    .filter((result) => result !== null);
}

function saveToDatabase(data, dbPath = "log_data.db") {
  const db = new sqlite3.Database(dbPath);

  const tryInsert = (retryCount = 0) => {
    try {
      // Create table
      db.run(`CREATE TABLE IF NOT EXISTS logs
              (time TEXT, layer_source TEXT, message TEXT)`);
      
      // Insert data
      const stmt = db.prepare("INSERT INTO logs VALUES (?, ?, ?)");
      data.forEach((row) => stmt.run(row));
      stmt.finalize();
    } catch (error) {
      if (error.message.includes("SQLITE_BUSY") && retryCount < 5) {
        console.log(
          `Database is busy, retrying (attempt ${retryCount + 1})...`
        );
        setTimeout(() => tryInsert(retryCount + 1), 100); // Retry after 100 milliseconds
      } else {
        console.error("Error saving to database:", error.message);
      }
    }
  };

  tryInsert();

  db.close();
}

// Example usage
const logFilePath = "test";
const parsedData = processLogFile(logFilePath);
saveToDatabase(parsedData);

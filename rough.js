// const fs = require('fs');

// fs.readFile('word_logid_mapping.jsonl', 'utf8', (err, data) => {
//   if (err) {
//     console.error("Error reading file:", err);
//     return;
//   }
//   try {
//     const jsonData = JSON.parse(data);
//     console.log(jsonData);
//   } catch (err) {
//     console.error("Error parsing JSON string:", err);
//   }
// });

// let str = "console.log('Hello, World!')";
// eval(str);

// 
//  

const { query } = require('./database_queries');

async function runQueries() {
    try {
        const results = await query("SELECT time, layer_source, message FROM logs WHERE id=196611");

        console.log("Query Results:");
        console.log(results);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

runQueries();

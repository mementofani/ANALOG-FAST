require("dotenv").config();
const OpenAI = require("openai");

const assistant = await openai.beta.assistants.create({
    instructions: "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
    model: "gpt-4-1106-preview",
    tools: [{ "type": "code_interpreter" }]
});

import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const response = await openai.files.content("file-abc123");

  // Extract the binary data from the Response object
  const image_data = await response.arrayBuffer();

  // Convert the binary data to a Buffer
  const image_data_buffer = Buffer.from(image_data);

}

main();




//
//

// const { query } = require('./database_queries');

// async function runQueries() {
//     try {
//         const results = await query("SELECT time, layer_source, message FROM logs WHERE id=196611");

//         console.log("Query Results:");
//         console.log(results);
//     } catch (error) {
//         console.error("An error occurred:", error);
//     }
// }

// runQueries();

const { promptI, promptII } = require("./prompts/prompts.js");
require("dotenv").config();
const fs = require("fs").promises;

class Summarizer {
  constructor(num_chunks, assistant) {
    this.num_chunks = num_chunks;
    this.assistant = assistant;
    this.summary = "";
    this.numberBuffer = 0;
    this.promptToSend = "";
    console.log("Summarizer initialized");
    console.log(this.assistant);
    console.log(this.num_chunks);
  }

  async summarizeChunks() {
    while (this.numberBuffer < this.num_chunks) {
      this.numberBuffer++;
      // Build the file path for the current chunk
      const chunkFilePath = `chunks/chunk${this.numberBuffer}.txt`;
      console.log("Chunk file path: " + chunkFilePath);
      console.log("Reading file: " + chunkFilePath); // Add this line for debugging
      // Read the content of the chunk file asynchronously
      const chunkContent = await fs.readFile(chunkFilePath, "utf-8");

      console.log("Chunk content is" + chunkContent);

      if (this.summary === "") {
        this.promptToSend = promptII + chunkContent;
      } else {
        this.promptToSend = promptI + this.summary + promptII + chunkContent;
      }

      // Assuming assistant.askQuestionAI is an asynchronous function

      console.log("PROMPT TO SEND: " + this.promptToSend);
      this.summary = await this.assistant.askQuestionAI(this.promptToSend);
    }

    // Write the summary to a file after processing all chunks
    await fs.writeFile(`summary/summary.txt`, this.summary, "utf-8");

    return this.summary;
  }
}

module.exports = Summarizer;

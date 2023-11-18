const fs = require("fs");

class Chunks {
  constructor(file_path, num_chunks) {
    this.file_path = file_path;
    this.num_chunks = num_chunks;
  }

  async splitFile() {
    // Read the entire content of the file
    const content = fs.readFileSync(this.file_path, "utf-8");

    // Calculate the size of each chunk
    const chunk_size = Math.floor(content.length / this.num_chunks);

    // Split the content and write to separate files
    for (let i = 0; i < this.num_chunks; i++) {
      const start = i * chunk_size;
      const end = i === this.num_chunks - 1 ? undefined : start + chunk_size;
      const chunkContent = content.slice(start, end);

      fs.writeFileSync(`chunks/chunk${i + 1}.txt`, chunkContent, "utf-8");
    }
  }

  async execute() {
    try {
      await this.splitFile();
      console.log("File split into chunks successfully.");
    } catch (error) {
      console.error("An error occurred while splitting the file:", error);
    }
  }
}

module.exports = Chunks;

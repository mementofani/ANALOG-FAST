require("dotenv").config();
const fs = require("fs").promises;
const { promptI, promptII } = require("./prompts/prompts.js");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { query } = require("./database_queries");
const OpenAIAssistant = require("./OpenAIAssistant");
const Summarizer = require("./summary.js"); // Corrected import
const Chunks = require("./chunks.js"); // Correct the casing here

async function askQuestion(question) {
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    const assistant = new OpenAIAssistant(
      "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"
    );

    await assistant.createAssistantSummary();

    await assistant.createThread();

    // Create an instance of Summarizer and Chunks
    // const summarizer = new Summarizer(4000, assistant);
    const chunker = new Chunks("final_log.out", 4000);
    console.log(4);

    await chunker.execute(); // Split the file into chunks

    let numberBuffer = 0;
    let num_chunks = 4000;
    let summary = "";
    while (numberBuffer < 100) {
      numberBuffer += 20;
      // Build the file path for the current chunk
      const chunkFilePath = `chunks/chunk${numberBuffer}.txt`;
      console.log("Chunk file path: " + chunkFilePath);
      console.log("Reading file: " + chunkFilePath); // Add this line for debugging
      // Read the content of the chunk file asynchronously
      const chunkContent = await fs.readFile(chunkFilePath, "utf-8");

      console.log("Chunk content is" + chunkContent);

      if (summary === "") {
        promptToSend = promptII + chunkContent;
      } else {
        promptToSend = promptI + summary + promptII + chunkContent;
      }

      // Assuming assistant.askQuestionAI is an asynchronous function

      console.log("PROMPT TO SEND: " + promptToSend);
      summary = await assistant.askQuestionAI(promptToSend);
    }

    // Write the summary to a file after processing all chunks
    await fs.writeFile(`summary/summary.txt`, summary, "utf-8");

    // Summarize the chunks
    //await summarizer.summarizeChunks();

    /*
        let keepAsking = true;

        while (keepAsking) {
          const userQuestion = await askQuestion("\n What is your question? ");

          // Criticizing
          // Create the criticizer before the query is asked, since we need

          const sqlLiteQuery = JSON.parse(
            await assistant.generateSQLLiteQuery(userQuestion)
          );

          // Executing the generated SQLLite query and getting response
          const sqlLiteResponse = await query(sqlLiteQuery.sqlLite_query);
          const assistantResponse = await assistant.answerSqlLiteQuery(
            sqlLiteResponse
          );

          console.log("\nAssistant's response:");
          console.log(assistantResponse);

          // Asking the user if they want to continue
          const continueAsking = await askQuestion(
            "Do you want to ask another question? (yes/no) "
          );
          keepAsking = continueAsking.toLowerCase() !== "no";
        }

        console.log(
          "Alrighty then, I hope you found the answers you were looking for!\n"
        );
        readline.close();
      } catch (error) {
        console.log("An error occurred:", error);
      }
    }
    */
  } catch (error) {
    console.log("An error occurred:", error);
  } finally {
    readline.close();
  }
}

main();

const OpenAI = require("openai");
import {
  instructions,
  promptAsk,
  promptUserInput,
  promptToNormalize,
} from "./prompts/prompts";
class OpenAIAssistant {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async createAssistant() {
    this.assistant = await this.openai.beta.assistants.create({
      name: "Log-Analyst",
      instructions: instructions,
      model: "gpt-4",
    });
  }

  async createThread() {
    this.thread = await this.openai.beta.threads.create();
  }

  async generateSQLLiteQuery(question) {
    // Example prompt to generate SQLLite query
    //Max length of prompt check.

    const response = await this.askQuestionAI(promptUserInput + question);

    console.log(response);

    return response; // This should be an SQLLite query
  }

  async answerSqlLiteQuery(sqlLiteResponse) {
    // Assuming sqlLiteResponse is an array of rows or a similar structure
    // Convert the SQLLite response to a readable format for the AI to interpret

    const response = await this.askQuestionAI(
      promptToNormalize + JSON.stringify(sqlLiteResponse)
    );

    return response; // This should be a normal response
  }

  async askQuestionAI(question) {
    await this.openai.beta.threads.messages.create(this.thread.id, {
      role: "user",
      content: question,
    });

    let run = await this.openai.beta.threads.runs.create(this.thread.id, {
      assistant_id: this.assistant.id,
    });

    let runStatus = await this.openai.beta.threads.runs.retrieve(
      this.thread.id,
      run.id
    );

    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await this.openai.beta.threads.runs.retrieve(
        this.thread.id,
        run.id
      );
    }

    const messages = await this.openai.beta.threads.messages.list(
      this.thread.id
    );

    const lastMessageForRun = messages.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    return lastMessageForRun ? lastMessageForRun.content[0].text.value : null;
  }
}

module.exports = OpenAIAssistant;

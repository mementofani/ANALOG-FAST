require("dotenv").config();
const { OpenAI } = require('openai');

class SqlQueryGeneratorAgent {
    constructor() {
        this.openai = new OpenAI({
            apiKey: "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"
        });
    }

    async createThread() {
        this.thread = await this.openai.beta.threads.create();
    }

    async createAssistant() {
        this.assistant = await this.openai.beta.assistants.create({
            name: "SqlQueryGeneratorAgent",
            instructions:
                "Extract keywords from the following user query.",
            model: "gpt-4",
        });
    }

    async askQuestionAI(question) {
      const [thread, assistant] = await Promise.all([this.createThread(), this.createAssistant()]);

      await this.openai.beta.threads.messages.create(this.thread.id, {
          role: "user",
          content: question,
      });

      let run = await this.openai.beta.threads.runs.create(this.thread.id, {
          assistant_id: this.assistant.id,
      });

      let runStatus;
      do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          runStatus = await this.openai.beta.threads.runs.retrieve(this.thread.id, run.id);
      } while (runStatus.status !== "completed");

      const messages = await this.openai.beta.threads.messages.list(this.thread.id);
      const lastMessageForRun = messages.data
          .filter(
              (message) => message.run_id === run.id && message.role === "assistant"
          )
          .pop();

      return lastMessageForRun ? lastMessageForRun.content[0].text.value : null;
  }

}

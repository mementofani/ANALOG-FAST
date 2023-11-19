require("dotenv").config();
const { OpenAI } = require('openai');

class UserProxy {
    
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
            name: "UserProxyAgent",
            instructions:
            `Objective: As a user proxy agent, your responsibility is to streamline the dialogue between the user and specialized agents within this group chat.
            Your duty is to articulate user requests accurately to the relevant agents and maintain ongoing communication with them to guarantee the user's task is carried out to completion.
            Please do not respond to the user until the task is complete, an error has been reported by the relevant agent, or you are certain of your response.`,
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



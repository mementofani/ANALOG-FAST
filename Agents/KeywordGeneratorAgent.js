require("dotenv").config();
const { OpenAI } = require('openai');

class KeywordGeneratorAgent {
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
            name: "KeywordGeneratorAgent",
            instructions:
                "Please analyze the following user query and identify the primary keywords or phrases that are most relevant to understanding the user's request. Focus on extracting terms that are critical to the context and meaning of the query. Always use the function call",
            model: "gpt-4",
            tools: [{
                "type": "function",
                "function": {
                    "name": "extractKeywords",
                    "description": "Extract keywords from a given text",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "text": {
                                "type": "string",
                                "description": "The text to analyze",
                            }
                        }
                    }
                }
            }]
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

    // Define a method to execute the function call
    executeFunction(args) {
        // Logic to extract keywords from the text
        const text = args.text;
        // Implement your keyword extraction logic here
        return extractedKeywords;
    }
}

// Usage remains similar
const agent = new KeywordGeneratorAgent();
agent.askQuestionAI("How to resolve server connectivity issues in a Linux environment?")
    .then(keywords => console.log("Keywords:", keywords))
    .catch(error => console.error("Error:", error));

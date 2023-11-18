const OpenAI = require("openai");
const fs = require('fs');

class OpenAIAssistant {
    constructor(apiKey) {
        this.openai = new OpenAI({ apiKey });
    }

    async createAssistant() {
        this.assistant = await this.openai.beta.assistants.create({
            name: "Log-Analyst",
            instructions: `Task Description for Log Analysis Machine(Only JSON formatted responses and preffer short responses):
            Objective:

            Assist users in identifying specific issues or information within log files.
            Focus on accuracy and simple solutions.
            Data Access:
            
            Access to a SQLLiteite database with two tables:
            logs: Contains log entries formatted as 'time', 'layer_source', 'message'.
            word_logid_mapping: Maps column 'word' to column 'log_ids', identifiers of log lines containing the corresponding word.

            Operational Approach:
            
            SQLLite Query: Write SQLLite query for the database only simple query will be accepted.
            Data-Driven Analysis: Always begin with an analysis of the word_logid_mapping table to identify relevant keywords for any query type.
            Hallucination Avoidance: Emphasize data accuracy, and request additional context when unsure.


            Response Format:
            
            Responses always in JSON format, including:
            'plan_ahead' section for intended approach. Should be very short
            'sqlLite_query': A single query who's response will be used in next iteration as context for AI to narrow down the search.
            
            Actively request additional input or clarification for targeted data collection.
            Seek more context when in doubt.
            Generalized Query Analysis:
            
            Preliminary Keyword Analysis: Conduct initial query to identify relevant keywords for any query subjecton the word_logid_mapping table and afterwards.
            Context-Specific Query: And then Use identified keywords to formulate specific query for the logs table.
            Contextual Relevance: Ensure keywords are contextually appropriate for the query subject.`,
            model: "gpt-4"
        });
    }

    async createThread() {
        this.thread = await this.openai.beta.threads.create();
    }

    async generateSQLLiteQuery(question) {
        // Example prompt to generate SQLLite query
        const prompt = `{user_need_help_with:${question}}`;

        const response = await this.askQuestionAI(prompt);

        console.log(response);

        return response; // This should be an SQLLite query
    }

    async answerSqlLiteQuery(sqlLiteResponse) {
        // Assuming sqlLiteResponse is an array of rows or a similar structure
        // Convert the SQLLite response to a readable format for the AI to interpret
        const prompt = `Process the following SQLLite query results and provide a user-friendly interpretation: \n${JSON.stringify(sqlLiteResponse)}`;

        const response = await this.askQuestionAI(prompt);
        return response; // This should be a normal response
    }

    async askQuestionAI(question) {
        await this.openai.beta.threads.messages.create(this.thread.id, {
            role: "user",
            content: question
        });

        const run = await this.openai.beta.threads.runs.create(this.thread.id, {
            assistant_id: this.assistant.id,
        });

        let runStatus = await this.openai.beta.threads.runs.retrieve(this.thread.id, run.id);
        while (runStatus.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            runStatus = await this.openai.beta.threads.runs.retrieve(this.thread.id, run.id);
        }

        const messages = await this.openai.beta.threads.messages.list(this.thread.id);
        const lastMessageForRun = messages.data.filter(
            (message) => message.run_id === run.id && message.role === "assistant"
        ).pop();

        return lastMessageForRun ? lastMessageForRun.content[0].text.value : null;
    }
}

module.exports = OpenAIAssistant;
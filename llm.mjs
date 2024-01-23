import {LlamaModel, LlamaContext, LlamaChatSession} from "node-llama-cpp";

export class LLM {
    constructor(modelPath) {
        const model = new LlamaModel({
            modelPath: modelPath
        });
        const context = new LlamaContext({model});
        this.session = new LlamaChatSession({context});
    }

    async prompt(prompt) {
        return await this.session.prompt(prompt);
    }
}
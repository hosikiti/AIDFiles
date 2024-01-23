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

export const exportFunction = (answer) => {
    const FUNC_BEGIN = "<FUNCTIONS>";
    const FUNC_END = "</FUNCTIONS>";

    answer = answer.trim().replace(/\n/g, "").replace(new RegExp(FUNC_BEGIN, "ig"), FUNC_BEGIN).replace(new RegExp(FUNC_END, "ig"), FUNC_END);

    const funcStart = answer.indexOf(FUNC_BEGIN);
    const funcEnd = answer.indexOf(FUNC_END);
    if (funcStart === -1 || funcEnd === -1) {
        return null;
    }
    const body = answer.substring(funcStart + FUNC_BEGIN.length, funcEnd);
    try {
        return JSON.parse(body);
    } catch (e) {
        console.log(`Error parsing function: ${e}, answer was: ${answer}`)
        return null;
    }
}
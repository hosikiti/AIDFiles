import {LlamaModel, LlamaContext, LlamaChatSession} from "node-llama-cpp";

export class LLM {
    constructor(modelPath, functions) {
        const model = new LlamaModel({
            modelPath: modelPath
        });
        const context = new LlamaContext({
            model,
            contextSize: Math.min(4096, model.trainContextSize)
        });
        const session = new LlamaChatSession({
            contextSequence: context.getSequence()
        });

        this.session = session;
        this.functions = functions;
    }

    async prompt(prompt) {
        return await this.session.prompt(prompt, { functions: this.functions });
    }
}

export const extractFunction = (answer) => {
    const FUNC_BEGIN = "<FUNCTIONS>";
    const FUNC_END = "</FUNCTIONS>";

    // clean up the LLM's answer to properly extract a function definition
    // I sometimes faced that the model returns FUNCTIONs instead of FUNCTIONS, so had to convert it manually.
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
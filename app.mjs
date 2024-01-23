import {fileURLToPath} from "url";
import path from "path";
import { getFilenames } from "./file_util.mjs";
import arg from "arg";
import { LLM } from "./llm.mjs";

const args = arg({
    '--dir': String,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, "models", "llama-2-7b-function-calling.Q3_K_M.gguf")
const llm = new LLM(modelPath);

const functionsInPrompt = JSON.stringify({
    "function": "moveFile",
    "description": "Move file to another folder",
    "arguments": [
        {
            "name": "fromPath",
            "type": "string",
            "description": "File name to move"    
        },
        {
            "name": "toPath",
            "type": "string",
            "description": "Folder name to store this file in"
        }
    ]
}, null, 4);

const filenames = getFilenames(args['--dir']);

for( const filename of filenames) {
    const q1 = `Can you move this file to the proper folder?: ${filename}`;
    console.log(q1)

    const prompt = `<FUNCTIONS>${functionsInPrompt}</FUNCTIONS>\n\n[INST] ${q1}[/INST]`

    const a1 = await llm.prompt(prompt);

    // extract function from answer
    const funcJson = a1.replaceAll("\n", "").match(/<FUNCTIONS>(.*)<\/FUNCTIONS>/)[1];
    try {
        const func = JSON.parse(funcJson);
        console.log(`${JSON.stringify(func)}`)
    } catch (e) {
        console.log(`Error parsing function: ${e}, answer was: ${a1}`)
    }
}


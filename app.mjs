import {fileURLToPath} from "url";
import path from "path";
import {LlamaModel, LlamaContext, LlamaChatSession} from "node-llama-cpp";
import { getFilenames } from "./file_util.mjs";
import arg from "arg";

const args = arg({
    '--dir': String,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const model = new LlamaModel({
    // modelPath: path.join(__dirname, "models", "openhermes-2.5-mistral-7b.Q4_K_M.gguf")
    modelPath: path.join(__dirname, "models", "openhermes-2.5-mistral-7b.Q5_K_M.gguf")
});
const context = new LlamaContext({model});
const session = new LlamaChatSession({context});

const filenames = getFilenames(args['--dir']);

while( filenames.length > 0 ) {
    const list =[]
    for (let i = 0; i < 10; i++) {
        const filename = filenames.shift();
        if (filename) {
            list.push(filename);
        }
    }
    const filenameStr = list.join(", ");
    const q1 = `Group those files into folders and print as JSON: ${filenameStr}\n- Folder name should not include 'folder'\n - JSON format must be like this: {"foldername": ["filename1", "filename2" ... ]}\n`;
    console.log(q1)
    const a1 = await session.prompt(q1);
    console.log("AI: " + a1);
}


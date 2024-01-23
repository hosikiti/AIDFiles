import {fileURLToPath} from "url";
import path from "path";
import { getFilenames } from "./file_util.mjs";
import arg from "arg";
import { LLM, exportFunction } from "./llm.mjs";
import { moveFileSync } from 'move-file';
import fs from 'fs';

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

const inputDir = args['--dir']

if( !inputDir ) {
    console.log("Please specify the directory to move files from")
    process.exit(1)
}

const filenames = getFilenames(args['--dir']);

for( const filename of filenames) {
    try {
        if( filename.startsWith(".") ) {
            continue
        }

        // call the model
        const inst = `Can you move this file into a folder with a proper name?: ${filename}`;
        const prompt = `<FUNCTIONS>${functionsInPrompt}</FUNCTIONS>\n\n[INST] ${inst}[/INST]`

        const a1 = await llm.prompt(prompt);

        // extract the function
        const func = exportFunction(a1);
        if( !func ){
            console.log("No function found, skip")
            continue
        }

        // call the function
        const fromPath = `${inputDir}/${func.arguments.fromPath}`
        const outDir = `${inputDir}/${func.arguments.toPath}`
        if( !fs.existsSync(outDir) ) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        const toPath = `${outDir}/${func.arguments.fromPath}`
        
        console.log(`Moving ${fromPath} to ${toPath}`)
        fs.renameSync(fromPath, toPath)
    } catch(e) {
        console.log(`Error: ${e}, skip`)
        continue
    }
}


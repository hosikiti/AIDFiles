import {fileURLToPath} from "url";
import path from "path";
import { getFilenames } from "./file_util.mjs";
import arg from "arg";
import { LLM, exportFunction } from "./llm.mjs";
import fs from 'fs';
import { defineChatSessionFunction } from "node-llama-cpp";

const args = arg({
    '--dir': String,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, "models", "functionary-small-v2.2.q4_0.gguf")

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

const functionDefinitions = {
    moveFile: defineChatSessionFunction({
        description: "Move file to another folder",
        params: {
            type: "object",
            properties: {
                fromPath: {
                    type: "string",
                    description: "File name to move"
                },
                toPath: {
                    type: "string",
                    description: "Folder name to store this file in"
                }
            }
        },
        handler(params) {
            console.log(`YEAH!! Moving ${params.fromPath} to ${params.toPath}`)
            // return fs.renameSync(params.fromPath, params.toPath);
        }
    })
};

const llm = new LLM(modelPath, functionDefinitions);

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

        console.log(`Processing ${filename}`)

        // call the model
        const inst = `Move this ${filename} into an appropriate folders based on common sense`;

        const a1 = await llm.prompt(inst);

        console.log(`Answer: ${JSON.stringify(a1)}`)

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
        //fs.renameSync(fromPath, toPath)
    } catch(e) {
        console.log(`Error: ${e}, skip`)
        continue
    }
}


import fs from "fs";

// return all files in the given path
export const getFilenames = (path) => {
    const result = [];
    const filenames = fs.readdirSync(path);
    for (const filename of filenames) {
        const filepath = path + "/" + filename;
        const stat = fs.statSync(filepath);
        if (!stat.isDirectory()) {
            result.push(filename);
        }
    }

    return result
}


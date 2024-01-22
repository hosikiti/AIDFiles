import fs from "fs";

export const getFilenames = (path) => {
    const result = [];
    const filenames = fs.readdirSync(path);
    for (const filename of filenames) {
        const filepath = path + "/" + filename;
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            result.push(...getFilenames(filepath));
        } else {
            result.push(filepath);
        }
    }

    return [...filenames];
}
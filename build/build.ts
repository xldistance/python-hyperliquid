import fs from 'fs'
import path from 'path'

const SYNC_INIT = "./hyperliquid/__init__.py";
const ASYNC_INIT = "./hyperliquid/async_support/__init__.py";

const FOLDER = "./hyperliquid/"

const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        if (file.indexOf('static_dependencies') !== -1) {
            return;
        }
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
};



function regexAll (text, array) {
    for (const i in array) {
        let regex = array[i][0]
        const flags = (typeof regex === 'string') ? 'g' : undefined
        regex = new RegExp (regex, flags)
        text = text.replace (regex, array[i][1])
    }
    return text
}


async function cleanFile(filePath: string) {
    let fileContent = fs.readFileSync(filePath, 'utf8');

    fileContent = regexAll (fileContent, [
        [ /^from ccxt\./gm, 'from ' ], // new esm
    ]).trim ()

    fs.writeFileSync(filePath, fileContent);
}

async function cleanInit(filePath: string, async = false) {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    // const fileByLine = fileContent.split('\n');

    fileContent = regexAll (fileContent, [
        // [ /from ccxt\./gm, '' ], // new esm
    ]).trim ()

    const file: string[] = []
    const fileLines = fileContent.split('\n');

    let pattern: any = undefined;
    if (!async) {
        pattern = /^from ccxt\.([a-zA-Z0-9_]+) import \1.+/;
    } else {
        pattern = /^from ccxt\.async_support\.([a-zA-Z0-9_]+) import \1.+/;
    }
    let insideExchange = false
    for (const line of fileLines) {
        if (new RegExp(pattern).test(line)) {
            continue;
        }

        if (line.startsWith('#') || line.trim() === '') {
            file.push(line);
            continue;
        }

        if (line === 'exchanges = [') {
            insideExchange = true;
            continue;
        }

        if (insideExchange && line === ']') {
            insideExchange = false;
            continue;
        }

        if (insideExchange) {
            continue
        }

        if (line.startsWith('__all__')) {
            continue;
        }

        file.push(line);
    }

    file.push("")
    if (async) {
        file.push("from async_support import hyperliquid")
    } else {
        file.push("import hyperliquid")
    }

    let newFileContent = file.join('\n');
    newFileContent = regexAll (newFileContent, [
        [ /from ccxt\./gm, 'from ' ],
    ]).trim ()

    // save file
    fs.writeFileSync(SYNC_INIT, newFileContent);
}

async function main() {
    await cleanInit(SYNC_INIT);
    await cleanInit(ASYNC_INIT, true);
    const allFiles = getAllFiles(FOLDER);
    console.log(allFiles)
    for (const file of allFiles) {
        await cleanFile(file);
    }

}

main()
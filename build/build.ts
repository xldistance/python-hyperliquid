import fs from 'fs'
import path from 'path'

const SYNC_INIT = "./hyperliquid/__init__.py";
const ASYNC_INIT = "./hyperliquid/async_support/__init__.py";



function regexAll (text, array) {
    for (const i in array) {
        let regex = array[i][0]
        const flags = (typeof regex === 'string') ? 'g' : undefined
        regex = new RegExp (regex, flags)
        text = text.replace (regex, array[i][1])
    }
    return text
}



async function cleanInit() {
    let fileContent = fs.readFileSync(SYNC_INIT, 'utf8');
    // const fileByLine = fileContent.split('\n');

    fileContent = regexAll (fileContent, [
        // [ /from ccxt\./gm, '' ], // new esm
    ]).trim ()

    const file: string[] = []
    const fileLines = fileContent.split('\n');


    const pattern = /^from ccxt\.([a-zA-Z0-9_]+) import \1.+/;
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
    file.push("import hyperliquid")

    let newFileContent = file.join('\n');
    newFileContent = regexAll (newFileContent, [
        [ /from ccxt\./gm, 'from ' ],
    ]).trim ()

    // save file
    fs.writeFileSync(SYNC_INIT, newFileContent);
}

async function main() {
    await cleanInit();
}

main()
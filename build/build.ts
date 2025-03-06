import * as fs from 'fs'
import path from 'path'
import extractZip from 'extract-zip'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'url';
import { writeFileSync } from 'node:fs'
import { exec, execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// ##################### helpers ##################### //

function mkdir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function rmdir(dirPath: string): void {
    fs.rmSync(dirPath, { recursive: true, force: true });
}


function cp(source: string, destination: string): void {
    // check if source is file or dir
    if (!fs.existsSync(source)) {
        console.error(`Source file/directory does not exist: ${source}`);
        return;
    }
    const stats = fs.statSync(source);
    if (stats.isFile()) {
        // get parent directory
        const parentDir = path.dirname(destination);
        // check if parent directory exists
        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.copyFileSync(source, destination);
        return;
    }
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }
    const files = fs.readdirSync(source);
    for (const file of files) {
        const srcPath = path.join(source, file);
        const destPath = path.join(destination, file);
        cp(srcPath, destPath);
    }
}


// ################################################### //



class build {

    exchange:string;
    SYNC_INIT:string;
    ASYNC_INIT:string;
    FOLDER:string;

    constructor(exchange: string) {
        this.exchange = exchange;
        this.SYNC_INIT = `./${exchange}/__init__.py`;
        this.ASYNC_INIT = `./${exchange}/async_support/__init__.py`;
        this.FOLDER = `./${exchange}/`;
        this.init(exchange);
    }

    async downloadRepo() {
        try {
            execSync('rm -rf ccxt/', { stdio: 'ignore' });
        } catch (ex) {
            execSync('if exist "ccxt" (rmdir /s /q ccxt)'); // for windows (temporarily :)
        }
        execSync ('git clone --depth 1 https://github.com/ccxt/ccxt.git');
    }

    moveFiles (exchange:string): void {
        // for (const folder of ['', 'async_support', 'abstract', 'pro']) {
        //     mkdir(`${exchange}/${folder}`);
        // }
 
        const sourceDir = './ccxt/python/ccxt/';
        const targetDir = `./${exchange}/ccxt/`;

        // Copy exchange specific files
        cp(sourceDir + `async_support/${exchange}.py`, `${targetDir}async_support/${exchange}.py`);
        cp(sourceDir + `${exchange}.py`, `${targetDir}${exchange}.py`);
        cp(sourceDir + `abstract/${exchange}.py`, `${targetDir}abstract/${exchange}.py`);

        // Copy initialization and base files
        cp(sourceDir + '__init__.py', `${targetDir}__init__.py`);
        cp(sourceDir + 'base', `${targetDir}base`);
        cp(sourceDir + 'async_support/base', `${targetDir}async_support/base`);
        cp(sourceDir + 'async_support/__init__.py', `${targetDir}async_support/__init__.py`);
    
        // Copy pro files
        cp(sourceDir + 'pro/__init__.py', `${targetDir}pro/__init__.py`);
        cp(sourceDir + `pro/${exchange}.py`, `${targetDir}pro/${exchange}.py`);
    
        // Copy static dependencies
        cp(sourceDir + 'static_dependencies', `${targetDir}static_dependencies`);
    
        // Remove python directory
        // rmdir('./ccxt/');
    }
    
    getAllFiles (dirPath: string, arrayOfFiles: string[] = []): string[] {
        const files = fs.readdirSync(dirPath);
    
        files.forEach(file => {
            if (file.indexOf('static_dependencies') !== -1) {
                return;
            }
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });
    
        return arrayOfFiles;
    };
    
    regexAll (text, array) {
        for (const i in array) {
            let regex = array[i][0]
            const flags = (typeof regex === 'string') ? 'g' : undefined
            regex = new RegExp (regex, flags)
            text = text.replace (regex, array[i][1])
        }
        return text
    }
    

    async cleanFile(filePath: string) {
        let fileContent = fs.readFileSync(filePath, 'utf8');
    
        fileContent = this.regexAll (fileContent, [
            [ /^from ccxt\./gm, 'from ' ], // new esm
        ]).trim ()
    
        fs.writeFileSync(filePath, fileContent);
    }



        

    async cleanInit(filePath: string, async = false) {
        let fileContent = fs.readFileSync(filePath, 'utf8');
        // const fileByLine = fileContent.split('\n');

        fileContent = this.regexAll (fileContent, [
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
            file.push(`from async_support import ${exchange}`)
        } else {
            file.push(`import ${exchange}`)
        }

        let newFileContent = file.join('\n');
        newFileContent = this.regexAll (newFileContent, [
            [ /from ccxt\./gm, 'from ' ],
        ]).trim ()

        // save file
        fs.writeFileSync(this.SYNC_INIT, newFileContent);
    }

    async init (exchange:string) {
        // await this.downloadRepo();
        this.moveFiles(exchange);
        await this.cleanInit(this.SYNC_INIT);
        await this.cleanInit(this.ASYNC_INIT, true);
        const allFiles = this.getAllFiles(this.FOLDER);
        console.log(allFiles)
        for (const file of allFiles) {
            await this.cleanFile(file);
        }
    }
}


// -------------------------------------------------------------------------------- //




const argvs = process.argv.slice(2);
const exchange = argvs[0] || 'hyperliquid';
if (!exchange) {
    console.error('Please provide exchange name');
    process.exit(1);
}
const buildInstance = new build(exchange);

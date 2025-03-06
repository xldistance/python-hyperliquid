import * as fs from 'fs'
import path from 'path'
import extractZip from 'extract-zip'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'url';
import { writeFileSync } from 'node:fs'
import { exec, execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// ##################### helpers ##################### //

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
        this.SYNC_INIT = `./${exchange}/ccxt/__init__.py`;
        this.ASYNC_INIT = `./${exchange}/ccxt/async_support/__init__.py`;
        this.FOLDER = `./${exchange}/ccxt/`;
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
        const sourceDir = './ccxt/python/ccxt/';
        const targetDir = `./${exchange}/ccxt/`;
        const copyList = [
            // exchange files
            `${exchange}.py`,
            `abstract/${exchange}.py`,
            `async_support/${exchange}.py`,
            // base files
            'base',
            'async_support/base',
            '__init__.py',
            'async_support/__init__.py',
            // pro files
            'pro/__init__.py',
            `pro/${exchange}.py`,
            // static dependencies
            'static_dependencies',
        ];
        for (const file of copyList) {
            cp(sourceDir + file, targetDir + file);
        }
        // Remove python directory
        fs.rmSync('./ccxt/', { recursive: true, force: true });
    }
    
    regexAll (text, array) {
        for (const i in array) {
            let regex = array[i][0]
            const flags = (typeof regex === 'string') ? 'g' : undefined
            regex = new RegExp (regex, flags)
            text = text.replace (regex, array[i][1])
        }
        return text
    }

    async cleanInitFile(filePath: string, async = false) {
        let fileContent = fs.readFileSync(filePath, 'utf8');
        for (const id of this.allExchangesList) {
            if (id !== this.exchange) {
                fileContent = this.regexAll (fileContent, [
                    [ new RegExp(`from ccxt.${id} import ${id}.+\n`), '' ],
                    [ new RegExp(`\\s+'${id}',\n`), '' ],
                ]).trim ()
            }
        }
        fs.writeFileSync(this.SYNC_INIT, fileContent + '\n');
    }

    allExchangesList:string[] = [];

    async getAllExchangesList () {
        this.allExchangesList = fs.readdirSync('./ccxt/ts/src/').filter(file => file.endsWith('.ts')).map(file => file.replace('.ts', ''));
        // this.allExchangesList = [...fs.readFileSync('./ccxt/python/ccxt/__init__.py').matchAll(/from ccxt\.([a-z0-9_]+) import \1\s+# noqa: F401/g)].map(match => match[1]);
    }


    async init (exchange:string) {
        await this.downloadRepo();
        this.moveFiles(exchange);
        await this.getAllExchangesList();
        await this.cleanInitFile(this.SYNC_INIT);
        await this.cleanInitFile(this.ASYNC_INIT, true);
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

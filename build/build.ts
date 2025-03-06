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
        throw new Error(`Source file/directory does not exist: ${source}`);
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
    destinationFolder:string;

    constructor(exchange: string) {
        this.exchange = exchange;
        this.destinationFolder = __dirname +  `/../${exchange}/ccxt/`;
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
        const sourceDir = __dirname + '/ccxt/python/ccxt/';
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
            cp(sourceDir + file,  this.destinationFolder + file);
        }
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
                    [ new RegExp(`from ccxt\.${id} import ${id}.+\n`), '' ],
                    [ new RegExp(`from ccxt\.async_support\.${id} import ${id}.+\n`), '' ],
                    [ new RegExp(`\\s+'${id}',\n`), '' ],
                ]).trim ()
            }
        }
        const importJunction = `import sys\nimport ${this.exchange}.ccxt as ccxt_module\nsys.modules[\'ccxt\'] = ccxt_module\n\n`;
        fileContent = importJunction + fileContent;
        fs.writeFileSync(filePath, fileContent + '\n');
    }

    allExchangesList:string[] = [];

    async setAllExchangesList () {
        this.allExchangesList = fs.readdirSync(__dirname + '/ccxt/ts/src/').filter(file => file.endsWith('.ts')).map(file => file.replace('.ts', ''));
        // or
        //                    = [... fs.readFileSync('./ccxt/python/ccxt/__init__.py').matchAll(/from ccxt\.([a-z0-9_]+) import \1\s+# noqa: F401/g)].map(match => match[1]);
    }


    async init (exchange:string) {
        await this.downloadRepo();
        await this.setAllExchangesList();
        // Remove git dir now (after reading exchanges)
        fs.rmSync(__dirname + '/ccxt/', { recursive: true, force: true });
        this.moveFiles(exchange);

        await this.cleanInitFile(this.destinationFolder + '__init__.py');
        await this.cleanInitFile(this.destinationFolder + 'async_support/__init__.py', true);
    }
}


// -------------------------------------------------------------------------------- //




const argvs = process.argv.slice(2);
const exchange = argvs[0];
if (!exchange) {
    console.error('Please provide exchange name');
    process.exit(1);
}
const buildInstance = new build(exchange);

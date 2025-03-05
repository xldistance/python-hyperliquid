import * as fs from 'fs'
import path from 'path'


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
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }
    const files = fs.readdirSync(source);
    for (const file of files) {
        const srcPath = path.join(source, file);
        const destPath = path.join(destination, file);
        const stats = fs.statSync(srcPath);
        if (stats.isDirectory()) {
            cp(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
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

    
    moveFiles (exchange:string): void {
        mkdir(`${exchange}`);
        mkdir(`${exchange}/async_support'`);
        mkdir(`${exchange}/abstract`);
        mkdir(`${exchange}/pro`);
    
        // Copy initialization and base files
        fs.copyFileSync('./python/ccxt/__init__.py', `${exchange}/__init__.py`);
        cp('./python/ccxt/base', `./${exchange}/base`);
        cp('./python/ccxt/async_support/base', `./${exchange}/async_support/base`);
    
        // Copy exchange specific files
        fs.copyFileSync(`./python/ccxt/async_support/${exchange}.py`, `${exchange}/async_support/${exchange}.py`);
        fs.copyFileSync(`./python/ccxt/${exchange}.py`, `${exchange}/${exchange}.py`);
        fs.copyFileSync(`./python/ccxt/abstract/${exchange}.py`, `${exchange}/abstract/${exchange}.py`);
    
        // Copy required dependencies
        fs.copyFileSync('./python/ccxt/async_support/__init__.py', `${exchange}/async_support/__init__.py`);
    
        // Copy pro files
        fs.copyFileSync('./python/ccxt/pro/__init__.py', `${exchange}/pro/__init__.py`);
        fs.copyFileSync(`./python/ccxt/pro/${exchange}.py`, `${exchange}/pro/${exchange}.py`);
    
        // Copy static dependencies
        cp('./python/ccxt/static_dependencies', `${exchange}/static_dependencies`);
    
        // Remove python directory
        rmdir('./python/');
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
const exchange = argvs[0];
const buildInstance = new build(exchange);

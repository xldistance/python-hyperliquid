import * as fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ################################################### //



class build {

    language:string = 'python';

    exchange:string;
    sourceFolder:string;
    destinationFolder:string;
    downloadAndDelete:boolean;

    constructor(exchange: string, downloadAndDelete: boolean) {
        this.exchange = exchange;
        this.sourceFolder = __dirname +  `/ccxt/`;
        this.destinationFolder = __dirname +  `/../${exchange}/ccxt/`;
        this.downloadAndDelete = downloadAndDelete;
        // this.init(exchange);
    }

    async downloadRepo() {
        try {
            execSync('rm -rf ccxt/', { stdio: 'ignore' });
        } catch (ex) {
            execSync('if exist "ccxt" (rmdir /s /q ccxt)'); // for windows (temporarily :)
        }
        execSync ('git clone --depth 1 https://github.com/ccxt/ccxt.git');
    }

    copyFiles (exchange:string): void {
        const sourceDir = this.sourceFolder + '/python/ccxt/';
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
    
    allExchangesList:string[] = [];

    async setAllExchangesList () {
        this.allExchangesList = fs.readdirSync(__dirname + '/ccxt/ts/src/').filter(file => file.endsWith('.ts')).map(file => file.replace('.ts', ''));  //  [... fs.readFileSync('./ccxt/python/ccxt/__init__.py').matchAll(/from ccxt\.([a-z0-9_]+) import \1\s+# noqa/g)].map(match => match[1]);
    }

    createMetaPackage () {
        const originalPackage = JSON.parse (fs.readFileSync (__dirname + '/ccxt/package.json', 'utf8'));
        const packageJson = {
            name: this.exchange,
            description: `A Python cryptocurrency trading library for ${this.exchange}`,
            keywords: [this.exchange, "cryptocurrency", "trading", "library", "api", "rest", "websocket", "exchange", "ccxt"],
        };
        const extended = Object.assign (originalPackage, packageJson);
        extended['repository']['url'] = `https://github.com/ccxt/${this.language}-${this.exchange}.git`;
        // remove all props except
        const neededProps = ['name', 'version', 'description', 'keywords', 'repository', 'readme', 'author', 'license', 'bugs', 'homepage', 'collective', 'ethereum'];
        // remove with inline
        for (const key in extended) {
            if (!neededProps.includes(key)) {
                delete extended[key];
            }
        }
        fs.writeFileSync (__dirname + '/package-meta.json', JSON.stringify(extended, null, 4));
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
                    [ new RegExp(`from ccxt\.pro\.${id} import ${id}.+\n`), '' ],
                    [ new RegExp(`\\s+'${id}',\n`), '' ],
                ]).trim ()
            }
        }
        const importJunction = `import sys\n` + 
                               `import ${this.exchange}.ccxt as ccxt_module\n` + 
                               `sys.modules[\'ccxt\'] = ccxt_module\n\n`;
        fileContent = importJunction + fileContent;
        fs.writeFileSync(filePath, fileContent + '\n');
    }

    creataPackageInitFile () {
        const capitalized = capitalize (this.exchange);
        const cont = 'import sys\n' +
                    `import ${this.exchange}.ccxt as ccxt_module\n` +
                    'sys.modules[\'ccxt\'] = ccxt_module\n\n' +
                    `from ${this.exchange}.ccxt import ${this.exchange} as ${capitalized}Sync\n` +
                    `from ${this.exchange}.ccxt.async_support.${this.exchange} import ${this.exchange} as ${capitalized}Async\n` +
                    `from ${this.exchange}.ccxt.pro.${this.exchange} import ${this.exchange} as ${capitalized}Ws\n`
        fs.writeFileSync(this.destinationFolder + '/../__init__.py', cont);
    }

    addWsLines () {
        const path = this.destinationFolder + `pro/${this.exchange}.py`;
        const fileContent = fs.readFileSync(path, 'utf8');
        const addLine = `from ccxt.async_support import ${this.exchange} as ${this.exchange}Async\n`;
        const newContent = fileContent.replace(/class \w+\(.*?\):/, addLine + `\n\nclass ${this.exchange}(${this.exchange}Async):`);
        fs.writeFileSync(path, newContent);
    }

    async init () {
        if (this.downloadAndDelete) {
            await this.downloadRepo ();
        }
        this.copyFiles (this.exchange);
        await this.setAllExchangesList ();
        await this.creataPackageInitFile ();

        await this.cleanInitFile (this.destinationFolder + '__init__.py');
        await this.cleanInitFile (this.destinationFolder + 'async_support/__init__.py');
        await this.cleanInitFile (this.destinationFolder + 'pro/__init__.py');
        this.addWsLines ();

        // Remove git dir now (after reading exchanges)
        this.createMetaPackage ();
        if (this.downloadAndDelete) {
            fs.rmSync(__dirname + '/ccxt/', { recursive: true, force: true });
        }
    }

    sortMethods(methods) {
        return methods.sort((a, b) => {
            const aPriority = a.startsWith('fetch') || a.startsWith('create') ? 0 : 1;
            const bPriority = b.startsWith('fetch') || b.startsWith('create') ? 0 : 1;
            return aPriority - bPriority || a.localeCompare(b);
        });
    }


    updateReadme(methods, rawMethods, wsMethods, readmePath) {
        let readmeContent = fs.readFileSync(readmePath, 'utf8');

        const methodsFormatted = methods.map(method => `- \`${method}\``).join('\n');
        const rawMethodsFormatted = rawMethods.map(method => `- \`${method}\``).join('\n');
        const wsMethodsFormatted = wsMethods.map(method => `- \`${method}\``).join('\n');


        const newMethodsSection = `### REST Unified\n\n${methodsFormatted}\n`;

        const newWsMethodsSection = `### WS Unified\n\n${wsMethodsFormatted}\n`;

        const newRawMethodsSection = `### REST Raw\n\n${rawMethodsFormatted}\n`;

        // Replace the existing #Methods section
        const regex = /### REST Unified\n[\s\S]*?(?=\n#|$)/;
        if (regex.test(readmeContent)) {
            readmeContent = readmeContent.replace(regex, newMethodsSection);
        } else {
            readmeContent += `\n${newMethodsSection}`;
        }

        // handleRestRaw
        const rawMethodRegex = /### REST Raw\n[\s\S]*?(?=\n#|$)/
        if (rawMethodRegex.test(readmeContent)) {
            readmeContent = readmeContent.replace(rawMethodRegex, newRawMethodsSection);
        } else {
            readmeContent += `\n${newRawMethodsSection}`;
        }

        // handleWs
        const wsRegex = /### WS Unified\n[\s\S]*?(?=\n#|$)/;
        if (wsRegex.test(readmeContent)) {
            readmeContent = readmeContent.replace(wsRegex, newWsMethodsSection);
        } else {
            readmeContent += `\n${newWsMethodsSection}`;
        }


        fs.writeFileSync(readmePath, readmeContent, 'utf8');
    }

    async updateReadmeWithMethods() {
        const filePath = this.destinationFolder + '/' + this.exchange + '.py';
        const wsFilePath = this.destinationFolder + '/pro/' + this.exchange + '.py';
        const abstractFile = this.destinationFolder + '/abstract/' + this.exchange + '.py';
        const readme = 'README.md';


        const content = fs.readFileSync(filePath, 'utf8');
        const wsContent = fs.readFileSync(wsFilePath, 'utf8');
        const abstractContent = fs.readFileSync(abstractFile, 'utf8');
        const methodRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)/g;
        const abstractRegex = /\s+(\w+)\s=\s\w+\s=\s/g
        let restMethods: string[] = [];
        let wsMethods: string[] = [];
        let rawMethods: string[] = [];
        let match;

        while ((match = methodRegex.exec(content)) !== null) {
            const name = match[1];
            if (name.startsWith('parse') || name.startsWith('sign') || name.startsWith('handle') || name.startsWith('load')) {
                continue;
            }
            restMethods.push(`${name}(${match[2]})`);
        }

        while ((match = methodRegex.exec(wsContent)) !== null) {
            const name = match[1];
            if (name.startsWith('handle') || name.startsWith('parse') || name.startsWith('request') || name.startsWith('ping')) {
                continue;
            }
            wsMethods.push(`${name}(${match[2]})`);
        }

        while ((match = abstractRegex.exec(abstractContent)) !== null) {
            const name = match[1];
            rawMethods.push(`${name}(request)`);
        }


        // console.log(this.sortMethods(re))
        this.updateReadme(this.sortMethods(restMethods), rawMethods, wsMethods, readme);
        return restMethods;
    }
}



// -------------------------------------------------------------------------------- //




const argvs = process.argv.slice(2);
const exchange = argvs[0];
if (!exchange) {
    console.error('Please provide exchange name');
    process.exit(1);
}
const donwloadAndDelete = !argvs.includes('--nodownload');
const builder = new build(exchange, donwloadAndDelete);
if (argvs[1] === '--methods') {
    builder.updateReadmeWithMethods()
} else {
    builder.init()
}

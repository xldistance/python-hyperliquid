import fs from 'fs'
import path from 'path'

const SYNC_INIT = "./hyperliquid/__init__.py";
const ASYNC_INIT = "./hyperliquid/async_support/__init__.py";



async function cleanInit() {
    const fileContent = fs.readFileSync(SYNC_INIT, 'utf8');
    const fileByLine = fileContent.split('\n');

    for 
}

async function main() {
    await cleanInit();
}
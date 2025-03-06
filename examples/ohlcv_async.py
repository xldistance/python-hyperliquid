import os
import sys
import asyncio

root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.append(root + '/')

import ccxt.async_support as ccxt


async def main():
    instance = ccxt.hyperliquid({})
    await instance.load_markets()
    ohlcv = await instance.fetch_ticker("BTC/USDC:USDC")
    print(ohlcv)
    await instance.close()

asyncio.run(main())


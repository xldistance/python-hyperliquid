import os
import sys
import asyncio
root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.append(root + '/hyperliquid')


import hyperliquid.async_support as hyperliquid


async def main():
    instance = hyperliquid.hyperliquid({})
    await instance.load_markets()
    ohlcv = await instance.fetch_ohlcv("BTC/USDC:USDC", "1m")
    print(ohlcv)

asyncio.run(main())


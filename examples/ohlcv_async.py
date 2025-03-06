import os
import sys
import asyncio

root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.append(root + '/')

if sys.platform == 'win32':
	asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
      
import hyperliquid.ccxt.async_support as ccxt


async def main():
    instance = ccxt.hyperliquid({})
    await instance.load_markets()
    ticker = await instance.fetch_ticker("BTC/USDC:USDC")
    print(ticker)
    await instance.close()

asyncio.run(main())


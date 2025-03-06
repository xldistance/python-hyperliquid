import os
import sys
import asyncio

root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.append(root + '/')


import hyperliquid.ccxt.async_support as ccxt


async def main():
    instance = ccxt.hyperliquid({})
    await instance.load_markets()
    symbol = "BTC/USDC:USDC"

    # fetch ticker
    #
    ticker = await instance.fetch_ticker(symbol)
    print(ticker)

    # fetch ohlcv
    #
    ohlcv = await instance.fetch_ohlcv(symbol, "1m")
    print(ohlcv)

    # fetch trades
    #
    trades = await instance.fetch_trades(symbol)
    print(trades)


    # close after you finish
    await instance.close()

asyncio.run(main())


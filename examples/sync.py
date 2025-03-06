import os
import sys

root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.append(root + '/')

import hyperliquid.ccxt as ccxt


def main():
    instance = ccxt.hyperliquid({})
    instance.load_markets()
    symbol = "BTC/USDC:USDC"

    # fetch ticker
    #
    ticker = instance.fetch_ticker(symbol)
    print(ticker)

    # fetch ohlcv
    #
    ohlcv = instance.fetch_ohlcv(symbol, "1m")
    print(ohlcv)

    # fetch trades
    #
    trades = instance.fetch_trades(symbol, limit=5)
    print(trades)


main()


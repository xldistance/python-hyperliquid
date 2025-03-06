import os
import sys

root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.append(root + '/')

import hyperliquid.ccxt as ccxt


def main():
    instance = ccxt.hyperliquid({})
    instance.load_markets()
    ticker = instance.fetch_ticker("BTC/USDC:USDC")
    print(ticker)

main()


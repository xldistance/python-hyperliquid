import os
import sys

root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.append(root + '/')


import ccxt


def main():
    instance = ccxt.hyperliquid({})
    markets = instance.load_markets()
    ohlcv = instance.fetch_ticker("BTC/USDC:USDC")
    print(ohlcv)

main()



# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# ----------------------------------------------------------------------------

__version__ = '4.4.60'

# ----------------------------------------------------------------------------

from async_support.base.exchange import Exchange  # noqa: F401

# CCXT Pro exchanges (now this is mainly used for importing exchanges in WS tests)

from pro.alpaca import alpaca                                        # noqa: F401
from pro.ascendex import ascendex                                    # noqa: F401
from pro.bequant import bequant                                      # noqa: F401
from pro.binance import binance                                      # noqa: F401
from pro.binancecoinm import binancecoinm                            # noqa: F401
from pro.binanceus import binanceus                                  # noqa: F401
from pro.binanceusdm import binanceusdm                              # noqa: F401
from pro.bingx import bingx                                          # noqa: F401
from pro.bitcoincom import bitcoincom                                # noqa: F401
from pro.bitfinex import bitfinex                                    # noqa: F401
from pro.bitfinex1 import bitfinex1                                  # noqa: F401
from pro.bitget import bitget                                        # noqa: F401
from pro.bithumb import bithumb                                      # noqa: F401
from pro.bitmart import bitmart                                      # noqa: F401
from pro.bitmex import bitmex                                        # noqa: F401
from pro.bitopro import bitopro                                      # noqa: F401
from pro.bitpanda import bitpanda                                    # noqa: F401
from pro.bitrue import bitrue                                        # noqa: F401
from pro.bitstamp import bitstamp                                    # noqa: F401
from pro.bitvavo import bitvavo                                      # noqa: F401
from pro.blockchaincom import blockchaincom                          # noqa: F401
from pro.blofin import blofin                                        # noqa: F401
from pro.bybit import bybit                                          # noqa: F401
from pro.cex import cex                                              # noqa: F401
from pro.coinbase import coinbase                                    # noqa: F401
from pro.coinbaseadvanced import coinbaseadvanced                    # noqa: F401
from pro.coinbaseexchange import coinbaseexchange                    # noqa: F401
from pro.coinbaseinternational import coinbaseinternational          # noqa: F401
from pro.coincatch import coincatch                                  # noqa: F401
from pro.coincheck import coincheck                                  # noqa: F401
from pro.coinex import coinex                                        # noqa: F401
from pro.coinone import coinone                                      # noqa: F401
from pro.cryptocom import cryptocom                                  # noqa: F401
from pro.currencycom import currencycom                              # noqa: F401
from pro.defx import defx                                            # noqa: F401
from pro.deribit import deribit                                      # noqa: F401
from pro.exmo import exmo                                            # noqa: F401
from pro.gate import gate                                            # noqa: F401
from pro.gateio import gateio                                        # noqa: F401
from pro.gemini import gemini                                        # noqa: F401
from pro.hashkey import hashkey                                      # noqa: F401
from pro.hitbtc import hitbtc                                        # noqa: F401
from pro.hollaex import hollaex                                      # noqa: F401
from pro.htx import htx                                              # noqa: F401
from pro.huobi import huobi                                          # noqa: F401
from pro.huobijp import huobijp                                      # noqa: F401
from pro.hyperliquid import hyperliquid                              # noqa: F401
from pro.idex import idex                                            # noqa: F401
from pro.independentreserve import independentreserve                # noqa: F401
from pro.kraken import kraken                                        # noqa: F401
from pro.krakenfutures import krakenfutures                          # noqa: F401
from pro.kucoin import kucoin                                        # noqa: F401
from pro.kucoinfutures import kucoinfutures                          # noqa: F401
from pro.lbank import lbank                                          # noqa: F401
from pro.luno import luno                                            # noqa: F401
from pro.mexc import mexc                                            # noqa: F401
from pro.myokx import myokx                                          # noqa: F401
from pro.ndax import ndax                                            # noqa: F401
from pro.okcoin import okcoin                                        # noqa: F401
from pro.okx import okx                                              # noqa: F401
from pro.onetrading import onetrading                                # noqa: F401
from pro.oxfun import oxfun                                          # noqa: F401
from pro.p2b import p2b                                              # noqa: F401
from pro.paradex import paradex                                      # noqa: F401
from pro.phemex import phemex                                        # noqa: F401
from pro.poloniex import poloniex                                    # noqa: F401
from pro.poloniexfutures import poloniexfutures                      # noqa: F401
from pro.probit import probit                                        # noqa: F401
from pro.upbit import upbit                                          # noqa: F401
from pro.vertex import vertex                                        # noqa: F401
from pro.whitebit import whitebit                                    # noqa: F401
from pro.woo import woo                                              # noqa: F401
from pro.woofipro import woofipro                                    # noqa: F401
from pro.xt import xt                                                # noqa: F401

exchanges = [
    'alpaca',
    'ascendex',
    'bequant',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bingx',
    'bitcoincom',
    'bitfinex',
    'bitfinex1',
    'bitget',
    'bithumb',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitpanda',
    'bitrue',
    'bitstamp',
    'bitvavo',
    'blockchaincom',
    'blofin',
    'bybit',
    'cex',
    'coinbase',
    'coinbaseadvanced',
    'coinbaseexchange',
    'coinbaseinternational',
    'coincatch',
    'coincheck',
    'coinex',
    'coinone',
    'cryptocom',
    'currencycom',
    'defx',
    'deribit',
    'exmo',
    'gate',
    'gateio',
    'gemini',
    'hashkey',
    'hitbtc',
    'hollaex',
    'htx',
    'huobi',
    'huobijp',
    'hyperliquid',
    'idex',
    'independentreserve',
    'kraken',
    'krakenfutures',
    'kucoin',
    'kucoinfutures',
    'lbank',
    'luno',
    'mexc',
    'myokx',
    'ndax',
    'okcoin',
    'okx',
    'onetrading',
    'oxfun',
    'p2b',
    'paradex',
    'phemex',
    'poloniex',
    'poloniexfutures',
    'probit',
    'upbit',
    'vertex',
    'whitebit',
    'woo',
    'woofipro',
    'xt',
]
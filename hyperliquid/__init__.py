import sys
import hyperliquid.ccxt as ccxt_module
sys.modules['ccxt'] = ccxt_module

from hyperliquid.ccxt import hyperliquid as hyperliquid_sync
from hyperliquid.ccxt.async_support.hyperliquid import hyperliquid as hyperliquid_async

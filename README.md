# hyperliquid-python
Python SDK (sync and async) for Hyperliquid with Rest and WS capabilities.

You can check Hyperliquid's docs here: [Docs](https://hyperliquid.gitbook.io/hyperliquid-docs)


*This package derives from CCXT and allows you to call pretty much every endpoint by either using the unified CCXT API or calling the endpoints directly*

## Installation

```
pip install hyperliquid
```

## Usage

### Async

```Python
from hyperliquid import HyperliquidAsync

async def main():
    instance = HyperliquidAsync({})
    order = await instance.create_limit_order("BTC/USDC:USDC", "limit", "buy", 1, 100000)
```

### Sync

```Python
from hyperliquid import HyperliquidSync

def main():
    instance = HyperliquidSync({})
    order =  instance.create_limit_order("BTC/USDC:USDC", "limit", "buy", 1, 100000)
```

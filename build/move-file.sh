## create hyperliquid folder
mkdir -p hyperliquid
mkdir -p hyperliquid/async_support
mkdir -p hyperliquid/abstract
mkdir -p hyperliquid/pro

cp ./python/ccxt/__init__.py hyperliquid/
cp -r ./python/ccxt/base  ./hyperliquid/
cp -r ./python/ccxt/async_support/base  ./hyperliquid/async_support/

cp ./python/ccxt/async_support/hyperliquid.py hyperliquid/async_support/
cp ./python/ccxt/hyperliquid.py hyperliquid/
cp ./python/ccxt/abstract/hyperliquid.py hyperliquid/abstract/

## move different required dependencies
cp ./python/ccxt/async_support/__init__.py hyperliquid/async_support/

## move pro files
cp ./python/ccxt/pro/__init__.py hyperliquid/pro/
cp ./python/ccxt/pro/hyperliquid.py hyperliquid/pro/

## move static dependencies
cp -r ./python/ccxt/static_dependencies hyperliquid/


rm -rf python/
import asyncio
import os
from random import randint
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.append(root + '/hyperliquid')


import hyperliquid


print(hyperliquid.__version__)


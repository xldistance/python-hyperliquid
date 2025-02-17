# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# -----------------------------------------------------------------------------

__version__ = '4.4.60'

# -----------------------------------------------------------------------------

from async_support.base.exchange import Exchange                   # noqa: F401

from base.decimal_to_precision import decimal_to_precision  # noqa: F401
from base.decimal_to_precision import TRUNCATE              # noqa: F401
from base.decimal_to_precision import ROUND                 # noqa: F401
from base.decimal_to_precision import TICK_SIZE             # noqa: F401
from base.decimal_to_precision import DECIMAL_PLACES        # noqa: F401
from base.decimal_to_precision import SIGNIFICANT_DIGITS    # noqa: F401
from base.decimal_to_precision import NO_PADDING            # noqa: F401
from base.decimal_to_precision import PAD_WITH_ZERO         # noqa: F401

from base import errors                                # noqa: F401
from base.errors import BaseError                                # noqa: F401
from base.errors import ExchangeError                            # noqa: F401
from base.errors import AuthenticationError                      # noqa: F401
from base.errors import PermissionDenied                         # noqa: F401
from base.errors import AccountNotEnabled                        # noqa: F401
from base.errors import AccountSuspended                         # noqa: F401
from base.errors import ArgumentsRequired                        # noqa: F401
from base.errors import BadRequest                               # noqa: F401
from base.errors import BadSymbol                                # noqa: F401
from base.errors import OperationRejected                        # noqa: F401
from base.errors import NoChange                                 # noqa: F401
from base.errors import MarginModeAlreadySet                     # noqa: F401
from base.errors import MarketClosed                             # noqa: F401
from base.errors import ManualInteractionNeeded                  # noqa: F401
from base.errors import InsufficientFunds                        # noqa: F401
from base.errors import InvalidAddress                           # noqa: F401
from base.errors import AddressPending                           # noqa: F401
from base.errors import InvalidOrder                             # noqa: F401
from base.errors import OrderNotFound                            # noqa: F401
from base.errors import OrderNotCached                           # noqa: F401
from base.errors import OrderImmediatelyFillable                 # noqa: F401
from base.errors import OrderNotFillable                         # noqa: F401
from base.errors import DuplicateOrderId                         # noqa: F401
from base.errors import ContractUnavailable                      # noqa: F401
from base.errors import NotSupported                             # noqa: F401
from base.errors import InvalidProxySettings                     # noqa: F401
from base.errors import ExchangeClosedByUser                     # noqa: F401
from base.errors import OperationFailed                          # noqa: F401
from base.errors import NetworkError                             # noqa: F401
from base.errors import DDoSProtection                           # noqa: F401
from base.errors import RateLimitExceeded                        # noqa: F401
from base.errors import ExchangeNotAvailable                     # noqa: F401
from base.errors import OnMaintenance                            # noqa: F401
from base.errors import InvalidNonce                             # noqa: F401
from base.errors import ChecksumError                            # noqa: F401
from base.errors import RequestTimeout                           # noqa: F401
from base.errors import BadResponse                              # noqa: F401
from base.errors import NullResponse                             # noqa: F401
from base.errors import CancelPending                            # noqa: F401
from base.errors import UnsubscribeError                         # noqa: F401
from base.errors import error_hierarchy                          # noqa: F401




base = [
    'Exchange',
    'exchanges',
    'decimal_to_precision',
]


from async_support import hyperliquid
import Big from 'big.js'

export const NetworkContextName = 'NETWORK'

export const TypeConnectWallet = {
  uninstalled: 'uninstalled',
  loading: 'loading',
  error: 'error',
  success: 'success',
}

export const ProxyUrlPrefix = {
  shuttleflow: '/rpcshuttleflow',
  sponsor: '/rpcsponsor',
}

/**
 * interval time config
 */
export const IntervalTime = {
  fetchBalance: 3000,
  fetchTokenList: 6000,
}

export const BigNumZero = new Big(0)

export const ZeroAddrHex = '0x0000000000000000000000000000000000000000'

export const TxReceiptModalType = {
  ongoing: 'ongoing',
  success: 'success',
  error: 'error',
}
export const MobileBreakpoint = 768

export const Decimal18 = '18'

export const TypeAccountStatus = {
  unconnected: 'unconnected',
  success: 'success',
  error: 'error',
}

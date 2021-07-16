// chain config constants
import React from 'react'
import PropTypes from 'prop-types'

import {IS_DEV} from '../utils'
import {checkHexAddress, checkCfxTokenAddress} from '../utils/address'
import {
  ChainBscLogo,
  ChainBtcLogo,
  ChainEthLogo,
  ChainCfxLogo,
  ChainOecLogo,
  MetamaskLogo,
  PortalLogo,
} from '../assets/svg'

/**
 * ethereum config
 */
export const KeyOfEth = 'eth'
export const ScanUrlEth = IS_DEV
  ? 'https://rinkeby.etherscan.io'
  : 'https://etherscan.io'
export const ChainIdEth = {
  MAINNET: 1,
  TESTNET: 4, // shuttle use Rinkeby network as testnet
  // ROPSTEN: 3,
  // GÖRLI: 5,
  // KOVAN: 42,
}

/**
 * bsc config
 */
export const KeyOfBsc = 'bsc'
export const ScanUrlBsc = IS_DEV
  ? 'https://testnet.bscscan.com'
  : 'https://bscscan.com'
export const ChainIdBsc = {
  MAINNET: 56,
  TESTNET: 97,
}

/**
 * oec config
 */

export const KeyOfOec = 'oec'
export const ScanUrlOec = IS_DEV
  ? 'https://www.oklink.com/okexchain'
  : 'https://www.oklink.com/okexchain-test'
export const ChainIdOec = {
  MAINNET: 66,
  TESTNET: 65,
}

/**
 * conflux config
 */
export const KeyOfCfx = 'cfx'
export const ScanUrlCfx = IS_DEV
  ? 'https://testnet.confluxscan.io'
  : 'https://confluxscan.io'
export const ChainIdCfx = {
  MAINNET: 1029,
  TESTNET: 1,
}

/**
 * bitcoin config
 */
export const KeyOfBtc = 'btc'
export const ScanUrlBtc = IS_DEV
  ? 'https://blockstream.info/testnet'
  : 'https://blockstream.info'

export const KeyOfPortal = 'portal'
export const KeyOfMetaMask = 'metamask'
export const WalletConfig = {
  [KeyOfPortal]: {
    key: KeyOfPortal,
    name: 'ConfluxPortal',
    website: 'https://portal.confluxnetwork.org',
    icon(className) {
      return <WalletIcon className={className} type={KeyOfPortal} />
    },
  },
  [KeyOfMetaMask]: {
    key: KeyOfMetaMask,
    name: 'MetaMask',
    website: 'https://metamask.io',
    icon(className) {
      return <WalletIcon className={className} type={KeyOfMetaMask} />
    },
  },
}

export const displayFilter = obj => {
  return obj?.supported === 1 && obj?.in_token_list === 1
}

/**
 * chain config
 */
export const ChainConfig = {
  [KeyOfEth]: {
    key: KeyOfEth,
    icon(className) {
      return <ChainIcon className={className} chain={KeyOfEth} />
    },
    fullName: 'Ethereum', //full name of the chain
    shortName: 'Ethereum', // short name of chain, usually used for fetching api
    tokenName: 'ETH', //the name of native token for this chain
    checkAddress: checkHexAddress,
    displayFilter,
    scanUrl: ScanUrlEth,
    scanTxUrl: ScanUrlEth + '/tx/',
    scanTokenUrl: ScanUrlEth + '/token/',
    // TODO
    // commonTokens: ['ETH', 'USDT', 'eCFX'],
    commonTokens: ['eth', '0xae080e58d91cf0b8a8de18ddcf92b9e5fbfadec5'],
    supportedChainIds: ChainIdEth,
    wallet: KeyOfMetaMask,
    remainderAmount: 0.15, //when you shuttle in some tokens,for example: ETH-cETH,you must have reminder of this amount to pay fee
  },
  [KeyOfBsc]: {
    key: KeyOfBsc,
    icon(className) {
      return <ChainIcon className={className} chain={KeyOfBsc} />
    },
    fullName: 'Binance Smart Chain',
    shortName: 'BSC',
    tokenName: 'BNB',
    checkAddress: checkHexAddress,
    displayFilter,
    scanUrl: ScanUrlBsc,
    scanTxUrl: ScanUrlBsc + '/tx/',
    scanTokenUrl: ScanUrlBsc + '/token/',
    // TODO
    commonTokens: ['BNB', 'bcUSDT', 'bCFX'],
    supportedChainIds: ChainIdBsc,
    wallet: KeyOfMetaMask,
    remainderAmount: 0.002,
  },
  [KeyOfOec]: {
    key: KeyOfOec,
    icon(className, size) {
      return <ChainIcon className={className} size={size} chain={KeyOfOec} />
    },
    fullName: 'OKExChain',
    shortName: 'OEC',
    tokenName: 'OKT',
    checkAddress: checkHexAddress,
    displayFilter,
    scanUrl: ScanUrlOec,
    scanTxUrl: ScanUrlOec + '/tx/',
    scanTokenUrl: ScanUrlOec + '/tokenAddr/',
    // TODO
    commonTokens: ['OKT'],
    supportedChainIds: ChainIdOec,
    wallet: KeyOfMetaMask,
    remainderAmount: 0.001,
  },
  [KeyOfCfx]: {
    key: KeyOfCfx,
    icon(className) {
      return <ChainIcon className={className} chain={KeyOfCfx} />
    },
    fullName: 'Conflux',
    shortName: 'Conflux',
    tokenName: 'CFX',
    checkAddress: checkCfxTokenAddress,
    displayFilter,
    scanUrl: ScanUrlCfx,
    scanTxUrl: ScanUrlCfx + '/transaction/',
    scanTokenUrl: ScanUrlCfx + '/address/',
    // TODO
    commonTokens: ['CFX', 'cUSDT', 'cETH'],
    supportedChainIds: ChainIdCfx,
    wallet: KeyOfPortal,
    remainderAmount: 1,
  },
  [KeyOfBtc]: {
    key: KeyOfBtc,
    icon(className) {
      return <ChainIcon className={className} chain={KeyOfBtc} />
    },
    fullName: 'Bitcoin',
    shortName: 'Bitcoin',
    tokenName: 'BTC',
    checkAddress() {
      //TODO:
      return true
    },
    displayFilter() {
      return true
    },
    scanUrl: ScanUrlBtc,
    scanTxUrl: ScanUrlBtc + '/tx/',
    commonTokens: [],
    remainderAmount: 0,
  },
}

export const SupportedChains = Object.keys(ChainConfig)

export const SupportedWallets = Object.keys(WalletConfig)

// set default chain to FromChain and ToChain when shuttle
export const DefaultFromChain = KeyOfEth
export const DefaultToChain = KeyOfCfx
export const SupportedChainIdsWeb3 = [
  ...Object.values(ChainConfig[KeyOfEth].supportedChainIds),
  ...Object.values(ChainConfig[KeyOfBsc].supportedChainIds),
  ...Object.values(ChainConfig[KeyOfOec].supportedChainIds),
]

const DefaultChainIconSize = 'w-10 h-10'
export function ChainIcon({chain, className = ''}) {
  let icon
  switch (chain) {
    case KeyOfEth:
      icon = <ChainEthLogo />
      break
    case KeyOfBsc:
      icon = <ChainBscLogo />
      break
    case KeyOfCfx:
      icon = <ChainCfxLogo />
      break
    case KeyOfBtc:
      icon = <ChainBtcLogo />
      break
    case KeyOfOec:
      icon = <ChainOecLogo />
      break
    default:
      //TODO: maybe need to change a better default icon
      icon = <></>
      break
  }
  return React.cloneElement(icon, {
    className: `${DefaultChainIconSize} ${className}`,
  })
}

const DefaultWalletIconSize = 'w-4 h-4'
export function WalletIcon({type, className = ''}) {
  let icon
  switch (type) {
    case KeyOfPortal:
      icon = <PortalLogo />
      break
    case KeyOfMetaMask:
      icon = <MetamaskLogo />
      break
  }
  return React.cloneElement(icon, {
    className: `${DefaultWalletIconSize} ${className}`,
  })
}

ChainIcon.propTypes = {
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  className: PropTypes.string,
}

WalletIcon.propTypes = {
  type: PropTypes.oneOf(SupportedWallets).isRequired,
  className: PropTypes.string,
}

import jsonRpc from './request'
import {ZeroAddrHex} from '../constants'

export function requestAllTokenList(url) {
  return jsonRpc(url, 'getTokenList', [])
}

export function requestToken(url, fromChain, toChain, address) {
  return jsonRpc(url, 'searchToken', [fromChain, toChain, address])
}

/**
 *
 * @param {*} url api url
 * @param {*} address (String) user conflux address (shuttle-in) or external chain address (shuttle-out)
 * @param {*} defi (String) conflux defi address (for shuttleflow frontend, hard code zero address)
 * @param {*} fromChain (String) source chain ("btc" | "cfx")
 * @param {*} toChain  (String) target chain ("cfx" | "eth" | "bsc")
 * @param {*} type (String) "in" | "out"
 */
export function requestUserWallet(
  url,
  address,
  defi = ZeroAddrHex,
  fromChain,
  toChain,
  type,
) {
  return jsonRpc(url, 'getUserWallet', [
    address,
    defi,
    fromChain,
    toChain,
    type,
  ])
}

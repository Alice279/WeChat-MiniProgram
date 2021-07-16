import {isHexAddress} from '@cfxjs/account'
import {validateBase32Address} from '@cfxjs/base32-address'
import {validate} from 'bitcoin-address-validation'
import {ChainIdCfx, KeyOfCfx, KeyOfBtc} from '../constants/chainConfig'
import {getEllipsStr, IS_DEV} from '../utils'

export function checkHexAddress(address) {
  return isHexAddress(address)
}

export function checkCfxTokenAddress(address, type) {
  return validateBase32Address(
    address,
    IS_DEV ? ChainIdCfx.TESTNET : ChainIdCfx.MAINNET,
    type,
  )
}

export function checkBtcAddress(address) {
  return validate(address)
}

export function shortenEthAddress(address) {
  if (!checkHexAddress(address)) return ''
  return getEllipsStr(address, 6, 4)
}

export function shortenBtcAddress(address) {
  if (!checkBtcAddress(address)) return ''
  return getEllipsStr(address, 10, 0)
}

export function shortenCfxAddress(address, type) {
  if (!checkCfxTokenAddress(address, type)) return ''
  const arr = address.split(':')
  const secondStr = getEllipsStr(arr[1], 4, 4)
  return arr[0] + ':' + secondStr
}

export function shortenAddress(chain, address, type = 'user') {
  if (chain === KeyOfCfx) return shortenCfxAddress(address, type)
  if (chain === KeyOfBtc) return shortenBtcAddress(address)
  return shortenEthAddress(address)
}

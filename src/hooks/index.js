import {useWindowSize} from 'react-use'
import {useMemo} from 'react'
import {KeyOfCfx, KeyOfBtc, KeyOfEth} from '../constants/chainConfig'
import {MobileBreakpoint} from '../constants'
import {useWallet} from '../hooks/useWallet'

export function useIsCfxChain(chain) {
  const isCfxChain = useMemo(() => chain === KeyOfCfx, [chain])
  return isCfxChain
}

export function useIsBtcChain(chain) {
  const isBtcChain = useMemo(() => chain === KeyOfBtc, [chain])
  return isBtcChain
}

export function useIsMobile() {
  const {width} = useWindowSize()
  if (width < MobileBreakpoint) return true
  return false
}

export function useConnectData() {
  const {address: cfxAddress} = useWallet(KeyOfCfx)
  const {address: ethAddress} = useWallet(KeyOfEth)
  const connectData = useMemo(
    () => [
      {
        chain: KeyOfCfx,
        address: cfxAddress,
      },
      {chain: KeyOfEth, address: ethAddress},
    ],
    [cfxAddress, ethAddress],
  )

  return connectData
}

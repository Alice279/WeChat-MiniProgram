/* eslint-disable react-hooks/exhaustive-deps */
import {useMemo, useState, useCallback} from 'react'
import {useEffectOnce} from 'react-use'
import {useBalance as usePortalBalance} from '@cfxjs/react-hooks'
import {ERC20_ABI} from '../abi'
import {KeyOfCfx} from '../constants/chainConfig'
import {BigNumZero, TypeConnectWallet} from '../constants'
import {getChainIdRight} from '../utils'
import {checkCfxTokenAddress} from '../utils/address'

function validAccounts(accounts) {
  return Array.isArray(accounts) && accounts.length
}

const isPortalInstalled = () => window?.conflux?.isConfluxPortal

function useChainNetId() {
  const [chainId, setChainid] = useState(window?.conflux?.chainId)

  useEffectOnce(() => {
    const chainListener = newChainId => {
      if (newChainId !== '0xNaN' && newChainId !== chainId) {
        setChainid(chainId)
      }
    }
    window?.conflux?.on('chainIdChanged', chainListener)
    return () => {
      window?.conflux?.off('chainIdChanged', chainListener)
    }
  })
  return {chainId}
}

export function useConnect() {
  const [address, setAddress] = useState(null)
  const [error, setError] = useState(null)
  const {chainId} = useChainNetId()
  const portalInstalled = isPortalInstalled()
  const [type, setType] = useState(
    portalInstalled ? TypeConnectWallet.uninstalled : TypeConnectWallet.success,
  )

  if (window && window.conflux && window.conflux.autoRefreshOnNetworkChange)
    window.conflux.autoRefreshOnNetworkChange = false

  useEffectOnce(() => {
    window?.conflux
      ?.send('cfx_accounts')
      .then(accounts => {
        if (validAccounts(accounts) && accounts[0] !== address) {
          setAddress(accounts[0])
        }
      })
      .catch(error => setError(error))
  })

  useEffectOnce(() => {
    // listen when account change
    const accountsLinstener = accounts => {
      if (validAccounts(accounts) && accounts[0] !== address) {
        setAddress(accounts[0])
      }
      if (accounts.length === 0) {
        setAddress(null)
      }
    }

    window?.conflux?.on('accountsChanged', accountsLinstener)
    return () => {
      window?.conflux?.off?.('accountsChanged', accountsLinstener)
    }
  })

  const login = useCallback(() => {
    setType(TypeConnectWallet.loading)
    if (!address) {
      if (window?.conflux)
        window.conflux
          .send('cfx_requestAccounts')
          .then(accounts => {
            setType(TypeConnectWallet.success)
            if (validAccounts(accounts)) {
              setAddress(accounts[0])
            }
          })
          .catch(err => {
            setType(TypeConnectWallet.error)
            setError(err)
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              console.error('Please connect to ConfluxPortal.')
            } else {
              console.error(err)
            }
          })
    }
  }, [address])

  return {
    type,
    tryActivate: login,
    error,
    address,
    chainId,
  }
}

export function useContract(address, ABI) {
  const confluxJS = window?.confluxJS
  const {chainId} = useConnect(KeyOfCfx)
  const isChainIdRight =
    getChainIdRight(KeyOfCfx, chainId, address, 'contract') || !address
  return useMemo(
    () => {
      if (!ABI || !confluxJS || !isChainIdRight) return null
      try {
        return confluxJS.Contract({abi: ABI, address})
      } catch (error) {
        return null
      }
    },
    [address, Boolean(confluxJS)],
    isChainIdRight,
  )
}

export function useTokenContract(tokenAddress) {
  return useContract(tokenAddress || '', ERC20_ABI)
}

/**
 * get CFX balance from Conflux Network
 * @returns balance of account
 */
export function useNativeTokenBalance(address) {
  const [balance] = usePortalBalance(address, [])
  return balance ? balance : BigNumZero
}

export function useTokenBalance(address, tokenAddress) {
  // eslint-disable-next-line no-unused-vars
  const [balance, tokenBalance] = usePortalBalance(
    address,
    tokenAddress && checkCfxTokenAddress(tokenAddress, 'contract')
      ? [tokenAddress]
      : [],
  )
  return tokenBalance ? tokenBalance : BigNumZero
}

export function useBalance(address, tokenAddress) {
  const isNativeToken = !checkCfxTokenAddress(tokenAddress, 'contract')
  const tokenBalance = useTokenBalance(address, tokenAddress) || BigNumZero
  const nativeTokenBalance = useNativeTokenBalance(address) || BigNumZero
  return isNativeToken ? nativeTokenBalance : tokenBalance
}

/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {convertDecimal} from '@cfxjs/data-format'
import {format} from 'js-conflux-sdk/dist/js-conflux-sdk.umd.min.js'
import Big from 'big.js'
import {BigNumber} from '@ethersproject/bignumber'
import {MaxUint256} from '@ethersproject/constants'
import {Logger} from '@ethersproject/logger'

import {Button, Loading} from '../../../../components'
import {Send} from '../../../../assets/svg'
import {SupportedChains} from '../../../../constants/chainConfig'
import {
  ContractConfig,
  ContractType,
} from '../../../../constants/contractConfig'

import {ZeroAddrHex, TxReceiptModalType} from '../../../../constants'
import {useIsNativeToken} from '../../../../hooks/useWallet'
import {
  useTokenContract,
  useTokenAllowance,
} from '../../../../hooks/useWeb3Network'
import {calculateGasMargin, getExponent} from '../../../../utils'
import {useShuttleContract} from '../../../../hooks/useShuttleContract'
import {useIsCfxChain} from '../../../../hooks'
import useShuttleAddress from '../../../../hooks/useShuttleAddress'

function ShuttleInButton({
  fromChain,
  toChain,
  fromToken,
  value,
  onClose,
  disabled,
  setTxModalType,
  setTxModalShow,
  setTxHash,
  fromAddress,
  toAddress,
}) {
  const {t} = useTranslation()
  const [approveShown, setApproveShown] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [didMount, setDidMount] = useState(false)
  const {
    address: fromTokenAddress,
    decimals,
    display_symbol,
    origin,
  } = fromToken
  const isCfxChain = useIsCfxChain(origin)
  const isNativeToken = useIsNativeToken(fromChain, fromTokenAddress)
  const drContractAddress =
    ContractConfig[ContractType.depositRelayer]?.address?.[fromChain]
  const drContract = useShuttleContract(ContractType.depositRelayer, fromChain)
  const tokenContract = useTokenContract(fromTokenAddress)
  const tokenAllownace = useTokenAllowance(fromTokenAddress, [
    fromAddress,
    drContractAddress,
  ])
  const shuttleAddress = useShuttleAddress(toAddress, toChain, fromChain, 'in')
  useEffect(() => {
    setDidMount(true)
    if (!isNativeToken) {
      if (
        new Big(tokenAllownace.toString(10)).lt(
          new Big(value).times(getExponent(decimals)),
        )
      ) {
        setApproveShown(true)
      } else {
        setApproveShown(false)
      }
    }
    return () => {
      setDidMount(false)
    }
  }, [decimals, tokenAllownace.toString(10), value, isNativeToken])

  function contractApprove(tokenContract, value, gas) {
    tokenContract
      .approve(drContractAddress, value, {
        gasLimit: gas ? calculateGasMargin(gas) : undefined,
      })
      .then(txResponse => {
        txResponse &&
          txResponse
            .wait()
            .then(() => {
              setIsApproving(false)
              setApproveShown(false)
            })
            .catch(() => {
              setIsApproving(false)
            })
      })
      .catch(() => {
        setIsApproving(false)
      })
  }

  const onApprove = async () => {
    if (isApproving) return
    setIsApproving(true)
    //MaxUint256
    tokenContract.estimateGas
      .approve(drContractAddress, MaxUint256)
      .then(gas => {
        contractApprove(tokenContract, MaxUint256, gas)
      })
      .catch(error => {
        if (
          error.code === Logger.errors.UNPREDICTABLE_GAS_LIMIT ||
          (error.data && error.data.code === -32000)
        ) {
          contractApprove(tokenContract, 0)
        } else {
          setIsApproving(false)
        }
      })
  }

  const onSubmit = async () => {
    setTxModalType(TxReceiptModalType.ongoing)
    if (isNativeToken) {
      let params = [
        format.hexAddress(toAddress),
        ZeroAddrHex,
        {
          value: convertDecimal(value, 'multiply', decimals),
        },
      ]
      let gas = await drContract.estimateGas.deposit(
        params[0],
        params[1],
        params[2],
      )
      setTxModalShow(true)
      drContract
        .deposit(params[0], params[1], {
          ...params[2],
          gasLimit: calculateGasMargin(gas),
        })
        .then(data => {
          setTxHash(data.hash)
          setTxModalType(TxReceiptModalType.success)
        })
        .catch(() => {
          setTxModalType(TxReceiptModalType.error)
        })
    } else {
      if (!isCfxChain) {
        let params = [
          fromTokenAddress,
          format.hexAddress(toAddress),
          ZeroAddrHex,
          convertDecimal(value, 'multiply', decimals),
          {
            value: BigNumber.from(0),
          },
        ]
        let gasDt = await drContract.estimateGas.depositToken(
          params[0],
          params[1],
          params[2],
          params[3],
          params[4],
        )
        setTxModalShow(true)
        drContract
          .depositToken(params[0], params[1], params[2], params[3], {
            ...params[4],
            gasLimit: calculateGasMargin(gasDt),
          })
          .then(data => {
            setTxHash(data?.hash)
            setTxModalType(TxReceiptModalType.success)
          })
          .catch(() => {
            setTxModalType(TxReceiptModalType.error)
          })
      } else {
        const amountVal = convertDecimal(value, 'multiply', decimals)
        setTxModalShow(true)
        try {
          const data = await tokenContract.transfer(shuttleAddress, amountVal)
          setTxHash(data?.hash)
          setTxModalType(TxReceiptModalType.success)
        } catch {
          setTxModalType(TxReceiptModalType.error)
        }
      }
    }
    onClose && onClose()
  }

  if (!didMount) {
    return null
  }

  return (
    <>
      {approveShown && (
        <Button
          onClick={onApprove}
          disabled={disabled}
          size="large"
          id="approve"
        >
          {isApproving && <Loading className="!w-6 !h-6" />}
          {!isApproving && t('approve', {tokenSymbol: display_symbol})}
        </Button>
      )}
      {!approveShown && (
        <Button
          id="shuttleIn"
          startIcon={<Send />}
          onClick={onSubmit}
          disabled={disabled}
          size="large"
        >
          {t('send')}
        </Button>
      )}
    </>
  )
}

ShuttleInButton.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
  setTxModalType: PropTypes.func,
  setTxHash: PropTypes.func,
  setTxModalShow: PropTypes.func,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
}

export default ShuttleInButton

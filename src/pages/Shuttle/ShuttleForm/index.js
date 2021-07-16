/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {convertDecimal, formatAmount} from '@cfxjs/data-format'
import Big from 'big.js'

import {WrapIcon, Button} from '../../../components'
import {
  DefaultFromChain,
  DefaultToChain,
  SupportedChains,
  KeyOfBtc,
} from '../../../constants/chainConfig'
import {TypeAccountStatus, Decimal18} from '../../../constants'

import {useBalance, useIsNativeToken} from '../../../hooks/useWallet'
import {useIsCfxChain, useIsBtcChain} from '../../../hooks'
import {BgChange, AlertTriangle} from '../../../assets/svg'
import {getMaxAmount} from '../../../utils'
import {checkBtcAddress} from '../../../utils/address'
import useShuttleAddress from '../../../hooks/useShuttleAddress'
import {useShuttleState} from '../../../state'
import ChainSelect from './ChainSelect'
import FromToken from './FromToken'
import ToToken from './ToToken'
import ToBtcAddress from './ToBtcAddress'
import {useCustodianData, useSponsorData} from '../../../hooks/useShuttleData'

function ShuttleForm({
  fromChain,
  toChain,
  fromToken,
  toToken,
  onChooseToken,
  onNextClick,
  onChangeValue,
  value,
  onChangeChain,
  onInvertChain,
  fromAddress,
  toAddress,
  fromAccountType,
  toAccountType,
}) {
  const {t} = useTranslation()
  const [errorMsg, setErrorMsg] = useState('')
  const [errorBtcAddressMsg, setErrorBtcAddressMsg] = useState('')
  const [btcAddressVal, setBtcAddressVal] = useState('')
  const [btnDisabled, setBtnDisabled] = useState(true)
  const {address, decimals, supported} = fromToken
  const isNativeToken = useIsNativeToken(fromChain, address)
  const isFromChainCfx = useIsCfxChain(fromChain)
  const isToChainCfx = useIsCfxChain(toChain)
  const isFromChainBtc = useIsBtcChain(fromChain)
  const isToChainBtc = useIsBtcChain(toChain)
  const shuttleAddress = useShuttleAddress(
    isFromChainBtc ? toAddress : '',
    fromChain,
    toChain,
    isFromChainCfx ? 'out' : 'in',
  )

  const balance = useBalance(fromChain, fromAddress, address)
  const {setFromBtcAddress, setToBtcAddress} = useShuttleState()
  const chainOfContract = isFromChainCfx ? toChain : fromChain //get the chain that is not conflux chain in the pair
  const {minimal_in_value, minimal_out_value, safe_sponsor_amount} =
    useCustodianData(chainOfContract, toToken)
  const {sponsorValue} = useSponsorData(chainOfContract, toToken)
  const balanceVal = convertDecimal(
    balance,
    'divide',
    isFromChainCfx ? Decimal18 : decimals,
  )

  const maxAmount = (
    isNativeToken ? getMaxAmount(fromChain, balanceVal) : balanceVal
  )?.toString(10)

  const minimalVal = isFromChainCfx
    ? minimal_out_value
      ? minimal_out_value.toString(10)
      : 0
    : minimal_in_value
    ? minimal_in_value.toString(10)
    : 0

  const shuttlePaused = () => {
    try {
      return (
        !(fromChain === KeyOfBtc || toChain === KeyOfBtc) &&
        sponsorValue?.lte(safe_sponsor_amount)
      )
    } catch (error) {
      return false
    }
  }

  const onMaxClick = () => {
    onChangeValue && onChangeValue(maxAmount)
    const error = validateData(maxAmount)
    setErrorMsg(error)
  }

  const onInputChange = e => {
    let value = e.target.value
    onChangeValue && onChangeValue(value)
    const error = validateData(value)
    setErrorMsg(error)
  }

  const onAddressInputChange = e => {
    let value = e.target.value
    setBtcAddressVal(value)
    const isBtcAddress = checkBtcAddress(value)
    if (!isBtcAddress) {
      setErrorBtcAddressMsg(t('error.addressInvalid'))
    } else {
      setErrorBtcAddressMsg('')
    }
  }

  const onNextBtnClick = () => {
    if (isFromChainBtc) {
      setFromBtcAddress(shuttleAddress)
    }
    if (isToChainBtc) {
      setToBtcAddress(btcAddressVal)
    }
    onNextClick && onNextClick()
  }

  function validateData(value) {
    if (!isFromChainBtc && !fromAddress) return ''
    let error = ''
    if (!isNaN(Number(value))) {
      const valBig = new Big(value || 0)
      if (valBig.gte(minimalVal)) {
        //must be greater than zero
        if (!isFromChainBtc && valBig.gt(maxAmount)) {
          //must be less than Max value
          error = t('error.mustLsMax', {value: formatAmount(maxAmount)})
        }
      } else {
        error = t('error.mustGtVal', {value: formatAmount(minimalVal)})
      }
    } else {
      //not a valid number
      error = t('error.inputValidAmount')
    }
    return error
  }

  useEffect(() => {
    setBtnDisabled(true)
    if (
      (!isFromChainBtc && isToChainCfx) ||
      (isFromChainCfx && !isToChainBtc)
    ) {
      if (
        fromAddress &&
        value &&
        !errorMsg &&
        fromAccountType === TypeAccountStatus.success &&
        toAccountType === TypeAccountStatus.success
      ) {
        setBtnDisabled(false)
      }
    } else {
      if (isFromChainBtc && toAddress && value && !errorMsg) {
        setBtnDisabled(false)
      }
      if (
        isToChainBtc &&
        fromAddress &&
        value &&
        !errorMsg &&
        btcAddressVal &&
        !errorBtcAddressMsg
      ) {
        setBtnDisabled(false)
      }
    }
  }, [
    value,
    btcAddressVal,
    errorBtcAddressMsg,
    errorMsg,
    fromAddress,
    isFromChainCfx,
    isFromChainBtc,
    isToChainBtc,
    isToChainCfx,
    toAddress,
    btnDisabled,
    fromAccountType,
    toAccountType,
  ])

  return (
    <div className="flex flex-col relative mt-4 md:mt-16 w-full md:w-110 items-center shadow-common py-6 px-3 md:px-6 bg-gray-0 rounded-2.5xl h-fit">
      <div className="flex w-full">
        <ChainSelect
          chain={fromChain || DefaultFromChain}
          type="from"
          onClick={onChangeChain}
          id="fromToken"
        />
        <FromToken
          fromChain={fromChain}
          toChain={toChain}
          fromToken={fromToken}
          fromAddress={fromAddress}
          value={value}
          balanceVal={balanceVal}
          onMaxClick={onMaxClick}
          onChooseToken={onChooseToken}
          onInputChange={onInputChange}
        />
      </div>
      <div className="flex w-full">
        <div className="w-29.5" />
        {errorMsg && <div className="text-xs text-error mt-2">{errorMsg}</div>}
      </div>
      <WrapIcon
        type="circle"
        size="w-8 h-8"
        className="my-4"
        onClick={onInvertChain}
        id="exchangeChain"
      >
        <BgChange />
      </WrapIcon>
      <div className="flex w-full">
        <ChainSelect
          chain={toChain || DefaultToChain}
          type="to"
          onClick={onChangeChain}
          fromChain={fromChain || DefaultFromChain}
          id="toChain"
        />
        <ToToken fromChain={fromChain} toChain={toChain} toToken={toToken} />
      </div>
      {isToChainBtc && (
        <ToBtcAddress
          btcAddressVal={btcAddressVal}
          errorBtcAddressMsg={errorBtcAddressMsg}
          onAddressInputChange={onAddressInputChange}
        />
      )}
      {!shuttlePaused() && supported !== 0 && (
        <Button
          className="mt-6"
          fullWidth
          size="large"
          disabled={btnDisabled}
          onClick={onNextBtnClick}
          id="next"
        >
          {t('next')}
        </Button>
      )}
      {supported === 0 && (
        <div className="flex flex-col w-full bg-warning-10 p-3 text-xs mt-6 text-warning-dark">
          <span className="flex items-center font-medium">
            <AlertTriangle className="mr-1 w-4 h-4" />
            {t('tips.notAvailable')}
          </span>
          <span className="inline-block mt-1">
            {t('tips.notAvailableDescription', {fromChain, toChain})}
          </span>
        </div>
      )}
      {shuttlePaused() && (
        <div className="flex flex-col w-full bg-warning-10 p-3 text-xs mt-6 text-warning-dark">
          <span className="flex items-center font-medium">
            <AlertTriangle className="mr-1 w-4 h-4" />
            {t('tips.shuttlePaused')}
          </span>
          <span className="inline-block mt-1">
            {t('tips.shuttlePausedDescription', {fromChain, toChain})}
          </span>
        </div>
      )}
    </div>
  )
}

ShuttleForm.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object,
  toToken: PropTypes.object,
  onChooseToken: PropTypes.func,
  onNextClick: PropTypes.func,
  onChangeValue: PropTypes.func,
  value: PropTypes.string,
  onChangeChain: PropTypes.func,
  onInvertChain: PropTypes.func,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  fromAccountType: PropTypes.string,
  toAccountType: PropTypes.string,
}

export default ShuttleForm

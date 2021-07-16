import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation, Trans} from 'react-i18next'
import {SupportedChains, ChainConfig} from '../../../constants/chainConfig'
import {Checkbox, Circle} from '../../../components'
import {useIsBtcChain, useIsCfxChain} from '../../../hooks'
import {ShuttleInButton, ShuttleOutButton} from './ShuttleButton'

function ConfirmTips({fromChain, toChain, ...props}) {
  const [checked, setChecked] = useState(false)
  const {t} = useTranslation()
  const isBtcChain = useIsBtcChain(toChain)
  const isCfxChain = useIsCfxChain(toChain)
  let BtnComp = isCfxChain ? ShuttleInButton : ShuttleOutButton

  return (
    <div
      id="confirmTips"
      className="flex w-full flex-col mt-6 bg-gray-10 px-6 pb-6 pt-4 text-gray-80 text-xs"
    >
      <span className="text-sm">{t('tips.mustKnow')}</span>
      <span className="flex items-center">
        <Circle />
        {isBtcChain ? t('tips.toBtcAddressTip') : t('tips.addressTip')}
      </span>
      {!isBtcChain && (
        <span className="flex items-center whitespace-pre">
          <Circle />
          <Trans i18nKey="tips.forbiddenAddressTip" />
        </span>
      )}
      {!isBtcChain && (
        <span className="flex items-center whitespace-pre">
          <Circle />
          <Trans
            i18nKey="tips.gasTip"
            values={{fromChain: ChainConfig[fromChain].shortName}}
          />
        </span>
      )}
      {isBtcChain && (
        <span className="flex items-center">
          <Circle />
          {t('tips.toBtcGasTip')}
        </span>
      )}
      {isBtcChain && (
        <span className="flex items-start">
          <Circle />
          {t('tips.btcWaitLongTip')}
        </span>
      )}
      <Checkbox
        id="checkBox"
        className="mt-4 mb-6"
        checked={checked}
        onChange={() => {
          setChecked(!checked)
        }}
      >
        <span className="text-primary text-xs">{t('checkboxLabel')}</span>
      </Checkbox>
      <BtnComp
        fromChain={fromChain}
        toChain={toChain}
        disabled={!checked}
        {...props}
      />
    </div>
  )
}

ConfirmTips.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
}

export default ConfirmTips

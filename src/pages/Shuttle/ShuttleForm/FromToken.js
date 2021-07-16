import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {formatAmount} from '@cfxjs/data-format'
import {SupportedChains} from '../../../constants/chainConfig'
import {Input, Tag} from '../../../components'
import {AccountStatus} from '../../components'
import TokenSelect from './TokenSelect'

function FromToken({
  fromChain,
  toChain,
  fromToken,
  onChooseToken,
  fromAddress,
  balanceVal,
  value,
  onInputChange,
  onMaxClick,
}) {
  const {t} = useTranslation()
  return (
    <div className="flex flex-col flex-1 border border-gray-10 rounded px-3 py-4 justify-between">
      <div className="flex justify-between">
        <TokenSelect
          id="fromToken"
          token={fromToken}
          type="from"
          fromChain={fromChain}
          toChain={toChain}
          onClick={() => onChooseToken && onChooseToken()}
        />
        <AccountStatus id="fromToken" chain={fromChain} size="medium" />
      </div>
      <div className="flex justify-between items-center">
        <Input
          id="shuttleAmount"
          bordered={false}
          value={value}
          onChange={onInputChange}
          placeholder="0.00"
          className="!text-gray-100 !text-lg !bg-transparent"
          width="w-32"
        />
        <div className="flex flex-col items-end">
          {fromAddress && (
            <span
              className="text-gray-40 text-xs inline-block mb-1"
              id="balance"
            >{`${t('balance')} ${formatAmount(balanceVal)}`}</span>
          )}
          {fromAddress && (
            <Tag size="small" onClick={onMaxClick} id="max">
              {t('max')}
            </Tag>
          )}
        </div>
      </div>
    </div>
  )
}

FromToken.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object,
  fromAddress: PropTypes.string,
  balanceVal: PropTypes.string,
  value: PropTypes.string,
  onChooseToken: PropTypes.func,
  onInputChange: PropTypes.func,
  onMaxClick: PropTypes.func,
}

export default FromToken

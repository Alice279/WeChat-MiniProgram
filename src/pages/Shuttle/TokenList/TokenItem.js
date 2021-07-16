import PropTypes from 'prop-types'
import _ from 'underscore'
import {SupportedChains} from '../../../constants/chainConfig'
import {TokenIcon} from '../../components'
import {WrapIcon} from '../../../components'
import {BgPlus} from '../../../assets/svg'
import {shortenAddress} from '../../../utils/address'
import useAddTokenToMetamask from '../../../hooks/useAddTokenToMetamask'
import {useIsCfxChain} from '../../../hooks'

function TokenItem({chain, token, selectedToken, onClick, ...props}) {
  const {address, display_symbol, display_name} = token
  const {addToken, success} = useAddTokenToMetamask(token)
  const isCfxChain = useIsCfxChain(chain)
  const tokenAddress = shortenAddress(chain, address, 'contract')

  const getSelectedStyle = () => {
    if (_.isEqual(token, selectedToken)) {
      return 'bg-gray-10'
    }
    return 'bg-gray-0 hover:bg-gray-10'
  }

  const onAddToken = e => {
    e.stopPropagation()
    if (success) return
    addToken()
  }

  return (
    <div
      aria-hidden="true"
      onClick={() => onClick && onClick(token)}
      className={`px-6 flex justify-between items-center w-full h-14 flex-shrink-0 cursor-pointer ${getSelectedStyle()}`}
      {...props}
    >
      <div className="flex items-center">
        <TokenIcon size="large" chain={chain} token={token} showAlarm={true} />
        <div className="flex flex-col ml-2">
          <span className="text-gray-100">{display_symbol}</span>
          <span className="text-gray-40 text-xs">{display_name}</span>
        </div>
      </div>
      <div className="flex">
        {tokenAddress && (
          <span className="text-xs text-primary">{tokenAddress}</span>
        )}
        {!isCfxChain && (
          <WrapIcon
            type="circle"
            className="ml-1 cursor-pointer"
            onClick={e => onAddToken(e)}
          >
            <BgPlus />
          </WrapIcon>
        )}
      </div>
    </div>
  )
}

TokenItem.propTypes = {
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  selectedToken: PropTypes.object.isRequired,
  token: PropTypes.object.isRequired,
  onClick: PropTypes.func,
}

export default TokenItem

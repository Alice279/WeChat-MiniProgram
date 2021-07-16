import PropTypes from 'prop-types'
import {
  SupportedChains,
  WalletIcon,
  ChainConfig,
} from '../../../constants/chainConfig'
import {shortenAddress} from '../../../utils/address'
import {useIsBtcChain} from '../../../hooks'
import {useShuttleState} from '../../../state'

function Account({
  chain,
  className,
  iconClassName,
  showIcon = false,
  address,
  ...props
}) {
  const walletKey = ChainConfig[chain].wallet
  const isBtcChain = useIsBtcChain(chain)
  const {toBtcAddress} = useShuttleState()

  return (
    <div className={`flex items-center ${className}`} {...props}>
      {showIcon && !isBtcChain && (
        <WalletIcon type={walletKey} className={iconClassName} />
      )}
      {!isBtcChain && address && shortenAddress(chain, address)}
      {isBtcChain && toBtcAddress && shortenAddress(chain, toBtcAddress)}
    </div>
  )
}

Account.propTypes = {
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  showIcon: PropTypes.bool,
  address: PropTypes.string,
}
export default Account

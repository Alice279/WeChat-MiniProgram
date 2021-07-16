import {
  ChainConfig,
  KeyOfPortal,
  KeyOfMetaMask,
} from '../../../constants/chainConfig'
import {Notification, Link} from '../../../components'

const useTransactionNotification = () => {
  return ({symbol, fromChain, toChain, value, isMobile}) =>
    Notification.open({
      title: `${value} ${symbol} from ${ChainConfig[fromChain].shortName} to ${ChainConfig[toChain].shortName}`,
      type: 'success',
      content: (
        <div>
          <Link className="!justify-start">View in history</Link>
        </div>
      ),
      duration: 0,
      placement: isMobile ? 'bottomRight' : 'topRight',
      bottom: isMobile ? 0 : 24,
      className: `${
        ChainConfig[fromChain].wallet === KeyOfPortal
          ? 'bg-portal'
          : ChainConfig[fromChain].wallet === KeyOfMetaMask
          ? 'bg-metamask'
          : ''
      } h-32`,
    })
}

export default useTransactionNotification

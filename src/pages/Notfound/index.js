import {useTranslation} from 'react-i18next'
import {NotFound} from '../../assets/img'
import {DarkNotFound} from '../../assets/img'
import {Button} from '../../components'
import useTheme from '../../hooks/useTheme'

function Maintenance() {
  const {t} = useTranslation()
  const {value: isDarkMode} = useTheme()
  const onOpenHome = () => {
    window.location.href = './'
  }
  return (
    <div className="fixed w-screen h-screen bg-info-10 flex justify-center items-center">
      <div className="-mt-28 flex flex-col items-center">
        <img
          className="w-100 md:w-200"
          src={isDarkMode ? DarkNotFound : NotFound}
          alt="notfound"
        />
        <span className="inline-block mt-8 text-gray-100 text-2lg font-medium">
          {t('notfound.notFound')}
        </span>
        <Button className="mt-6 w-40" size="large" onClick={() => onOpenHome()}>
          {t('notfound.goBack')}
        </Button>
      </div>
    </div>
  )
}
export default Maintenance

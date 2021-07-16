import {Suspense} from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import Shuttle from '../pages/Shuttle'
import History from '../pages/History'
import Home from '../pages/Home'
import Maintenance from '../pages/Maintenance'
import Notfound from '../pages/Notfound'
import {Web3ReactManager, Header, MobileFooter} from '../pages/components'
import {Loading} from '../components'
import {useIsMobile} from '../hooks'

function App() {
  const isMobile = useIsMobile()

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Loading className="w-20 h-20" />
        </div>
      }
    >
      <Router>
        <div className="flex flex-col h-full relative overflow-x-hidden">
          <Header />
          <div className="container mx-auto flex flex-1 justify-center md:pb-6 h-0">
            <Web3ReactManager>
              <Switch>
                <Route path="/shuttle">
                  <Shuttle />
                </Route>
                <Route path="/history">
                  <History />
                </Route>
                <Route path="/" exact>
                  <Home />
                </Route>
                <Route path="/maintenance">
                  <Maintenance />
                </Route>
                <Route path="/notfound">
                  <Notfound />
                </Route>
                <Route path="*">
                  <Redirect to="/notfound" />
                </Route>
              </Switch>
            </Web3ReactManager>
          </div>
          {isMobile && <MobileFooter />}
        </div>
      </Router>
    </Suspense>
  )
}

export default App

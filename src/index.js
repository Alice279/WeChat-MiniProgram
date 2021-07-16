import React from 'react'
import ReactDOM from 'react-dom'
import {createWeb3ReactRoot, Web3ReactProvider} from '@web3-react/core'
import './index.css'
import './i18n'
import App from './pages/App'
import reportWebVitals from './reportWebVitals'
import {NetworkContextName} from './constants'
import getLibrary from './utils/getLibrary'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <App />
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

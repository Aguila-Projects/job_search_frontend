import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App.tsx'
import { DarkModeProvider } from './context/DarkModeContext.tsx'
import './index.css'
import store from './redux/store'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Router>
    <Provider store={store}>
      <DarkModeProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </DarkModeProvider>
    </Provider>
  </Router>
)

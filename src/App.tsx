import { useEffect } from 'react'

import { me } from './redux/slices/authSlice'
import { useAppDispatch, useAppSelector } from './redux/store'
import AppRoutes from './routes/AppRoutes'

function App() {
  const dispatch = useAppDispatch()
  const { data } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!data?.auth) {
      dispatch(me())
    }
  }, [data])

  return <AppRoutes />
}

export default App

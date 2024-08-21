import { Navigate, Route, Routes } from 'react-router-dom'

import AuthComponent from './components/Auth/AuthComponent'
import AllJobPostingsComponent from './pages/AllJobPostingsComponent'
import AppliedJobsComponent from './pages/AppliedJobs'
import Home from './pages/Home'
import ProtectedRoutes from './ProtectedRoutes'
import { useAppSelector } from './redux/store'

const AppRoutes = () => {
  const { data } = useAppSelector((state) => state.auth)
  console.log('Data in AppRoutes:', data)
  return (
    <Routes>
      {!data || !data.token ? (
        <>
          <Route path="/auth" element={<AuthComponent />} />
          <Route path="/*" element={<Navigate to="/auth" replace />} />
        </>
      ) : (
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs/:company" element={<AllJobPostingsComponent />} />
          <Route
            path="/profile/applied-jobs"
            element={<AppliedJobsComponent />}
          />
          <Route
            path="/jobs/todays-jobs"
            element={<AllJobPostingsComponent isTodaysJobs={true} />}
          />
        </Route>
      )}
      <Route path="/*" element={<div> Error 404</div>} />
    </Routes>
  )
}

export default AppRoutes

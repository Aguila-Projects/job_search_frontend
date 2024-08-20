import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoutes from './ProtectedRoutes'
import AuthComponent from '../components/Auth/AuthComponent'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedLayout from '../layouts/ProtectedLayout'
import AllJobPostingsComponent from '../pages/AllJobPostingsComponent'
import AppliedJobsComponent from '../pages/AppliedJobs'
import Home from '../pages/Home'
import { useAppSelector } from '../redux/store'

const AppRoutes = () => {
  const { data } = useAppSelector((state) => state.auth)

  return (
    <Routes>
      {!data?.auth ? (
        <Route
          path="/auth"
          element={
            <AuthLayout>
              <AuthComponent />
            </AuthLayout>
          }
        />
      ) : (
        <Route path="/auth" element={<Navigate to="/" replace />} />
      )}
      <Route element={<ProtectedRoutes />}>
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          }
        />
        <Route
          path="/jobs/:company"
          element={
            <ProtectedLayout>
              <AllJobPostingsComponent />
            </ProtectedLayout>
          }
        />
        <Route
          path="/profile/applied-jobs"
          element={
            <ProtectedLayout>
              <AppliedJobsComponent />
            </ProtectedLayout>
          }
        />
        <Route
          path="/jobs/todays-jobs"
          element={
            <ProtectedLayout>
              <AllJobPostingsComponent isTodaysJobs={true} />
            </ProtectedLayout>
          }
        />
      </Route>

      <Route path="/*" element={<div> Error 404</div>} />
    </Routes>
  )
}

export default AppRoutes

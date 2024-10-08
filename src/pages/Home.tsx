// src/components/CompanyComponent.js

import { fetchApplications } from '@/redux/slices/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CompanyNameCard from '../components/Cards/CompanyNameCard'
import Search from '../components/Search'
import { API } from '../constants'
import { SkeletonCardLoader } from '../ui/JobPostingSkeleton'

interface JobSource {
  createdAt: string
  id: number
  name: string
  updatedAt: string
}
interface CompanyInfo {
  active: boolean
  apiEndpoint: string
  createdAt: string
  frontendUrl: string
  id: number
  jobSource: JobSource
  jobSourceId: number
  name: string
  slug: string
  updatedAt: string
}

const Home = () => {
  const [companyList, setCompanyList] = useState<CompanyInfo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { data } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const token = data?.token

  const handleCompanyClick = (company: any) => {
    navigate(`/jobs/${company.slug}`)
    console.log('COMPANY CLICKED', company)
  }

  useEffect(() => {
    console.log('Fetching company list...')
    setIsLoading(true)
    const fetchCompanyList = async () => {
      try {
        const { data } = await axios.get<CompanyInfo[]>(
          `${API.BASE_URL}${API.COMPANIES}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        console.log('Company list:', data)
        setCompanyList(data)
      } catch (error) {
        console.error('Error fetching company list:', error)
      }
    }
    fetchCompanyList()
    setIsLoading(false)
  }, [])

  // fetch all applications by dispatching fetchApplications thunk
  useEffect(() => {
    const userId = data?.auth?.id
    if (!userId) {
      console.error('User not logged in')
      return
    }
    console.log('Fetching applications for user:', userId)
    dispatch(fetchApplications(userId))
  }, [data])

  const handleSearchSubmit = async (query: string) => {
    console.log('Searching for companies with query:', query)
    setIsLoading(true)
    try {
      const { data } = await axios.get(
        `${API.BASE_URL}${API.COMPANIES}?name=${query}`
      )
      setCompanyList(data)
    } catch (error) {
      console.error('Error searching for companies:', error)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex w-full max-w-6xl flex-col items-center justify-start gap-4">
      <h2 className="text-lg font-bold">
        Welcome to the job board! Here you can find job listings for different
        companies.
      </h2>
      <Search onSubmitSearch={handleSearchSubmit} />
      <h3 className="text-center text-xl font-semibold">
        All Companies ({companyList?.length})
      </h3>

      <section className="h-[55dvh] w-full overflow-y-auto p-2 md:h-[65dvh] lg:h-[70dvh]">
        <div className="grid grid-cols-2 flex-wrap gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading
            ? Array.from({ length: 10 }, (_, index) => (
                <SkeletonCardLoader key={index} />
              ))
            : companyList?.map((company, idx) => (
                <CompanyNameCard
                  key={idx}
                  company={company}
                  onClick={() => handleCompanyClick(company)}
                />
              ))}
        </div>
      </section>
    </div>
  )
}

export default Home

// src/components/WorkdayCompanyComponent.tsx

import React, { useState, useEffect } from 'react';
import fetchWorkdayAPI from '../api/fetchWorkdayAPI'; // Adjust the import path as necessary
import WorkdayPosting from '../components/Cards/WorkdayPosting';
import sortJobsByPostedDate from '../utils/sortingFunction';
import fetchWorkdayLocations from '../api/fetchWorkdayLocations';
import { useNavigate, useParams } from 'react-router-dom';
import { workdayJobs } from '../constants/jobUrls';
import { useAppliedJobs } from '../hooks/useAppliedJobs';
import { extractWorkdayJobId } from '../utils/extractJobIds';
import { LoadingSpinner } from '../ui';
import JobPostingSkeleton, {
  SingleJobPostingSkeletonRow,
} from '../ui/JobPostingSkeleton';
import LocationDropdown from '../components/Dropdown/LocationDropdown';
import SinglePostingRow from '../components/Table/SinglePostingRow';
interface LocationsData {
  locations?: string[];
  locationCountry?: string[];
}
const WorkdayCompanyJobsList = () => {
  const [jobs, setJobs] = useState<any>({});
  const [offset, setOffset] = useState<number>(0);
  const [totalJobCount, setTotalJobCount] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [tempSearchText, setTempSearchText] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');
  const [dropdownCities, setDropdownCities] = useState<[]>([]);
  const [dropdownCountries, setDropdownCountries] = useState<[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<any>({
    locations: [],
    locationCountry: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { company } = useParams<{ company: string }>();
  const currentCompany = workdayJobs.find((comp) => comp.name === company);
  const [appliedJobs, toggleJobApplication] = useAppliedJobs(
    company as string,
    extractWorkdayJobId
  );

  // useEffect(() => {
  //   if (isLoading) {
  //     document.body.classList.add('no-scroll');
  //   } else {
  //     document.body.classList.remove('no-scroll');
  //   }

  //   // Cleanup function to remove the class when the component unmounts
  //   return () => {
  //     document.body.classList.remove('no-scroll');
  //   };
  // }, [isLoading]);

  useEffect(() => {
    const getWorkdayJobs = async (company: string) => {
      setIsLoading(true);
      try {
        console.log(
          'selectedLocations in getWorkdayJobs >>>\n',
          selectedLocations
        );
        const data = await fetchWorkdayAPI(
          company as string,
          20,
          offset,
          searchText,
          selectedLocations
        );

        console.log('data', data);

        if (!data) {
          navigate('/');
          return;
        }

        if (offset === 0) setTotalJobCount(data.total);

        if (data.jobPostings) {
          // Sort the job postings based on the 'sortOrder' state
          const sortedJobPostings = [...data.jobPostings].sort((a, b) =>
            sortJobsByPostedDate(a, b, sortOrder)
          );
          setJobs({
            ...data,
            jobPostings: sortedJobPostings,
          });
        } else {
          setJobs(data);
        }

        if (data.locations.cities && data.locations.countries) {
          setDropdownCities(data.locations.cities);
          setDropdownCountries(data.locations.countries);
        } else if (data.locations.cities) {
          setDropdownCities(data.locations.cities);
        } else if (data.locations.countries) {
          setDropdownCountries(data.locations.countries);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (company) {
      getWorkdayJobs(company);
      // getWorkdayLocations(company);
    }
  }, [company, offset, searchText, sortOrder, navigate, selectedLocations]);

  useEffect(() => {
    const fetchLocations = async (company: string) => {
      try {
        setIsLoading(true);
        const data = await fetchWorkdayAPI(company);
        if (data.locations.cities) {
          setDropdownCities(data.locations.cities);
        }
        if (data.locations.countries) {
          setDropdownCountries(data.locations.countries);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    if (company) {
      fetchLocations(company);
    }
  }, [company]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchText(tempSearchText);
    setOffset(0);
  };

  const handleLocationChange = (
    locationId: string,
    isChecked: boolean,
    type: 'locations' | 'locationCountry'
  ) => {
    setSelectedLocations((prev: any) => {
      // Determine the field based on the type
      const field = type === 'locations' ? 'locations' : 'locationCountry';

      // Filter out the locationId if unchecked, or add it if checked and not already included
      const updatedLocations = isChecked
        ? [...prev[field], locationId].filter(
            (value, index, self) => self.indexOf(value) === index
          ) // Ensure no duplicates
        : prev[field].filter((id: string) => id !== locationId);

      return {
        ...prev,
        [field]: updatedLocations,
      };
    });
  };
  console.log('isloading', isLoading);
  const fetchJobDetails = async (jobId: number) => {
    console.log('jobId', jobId);
  };
  const handleApplicationToggle = (job: any) => {
    const jobId = job.id;
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '{}');
    if (company) {
      if (!appliedJobs[company]) {
        appliedJobs[company] = {};
      }

      if (appliedJobs[company][jobId]) {
        delete appliedJobs[company][jobId];
      } else {
        const jobToSave = jobs.find((job) => job.id === jobId);
        if (jobToSave) {
          const dateApplied = new Date().toISOString().split('T')[0];
          appliedJobs[company][jobId] = {
            ...jobToSave,
            applied: true,
            appliedDate: dateApplied,
            status: 'active',
            considering: true,
          };
          // const fileContent = `Job ID: ${jobToSave.id}, Title: ${jobToSave.title}, Company: ${company}, Date Applied: ${dateApplied}\n`;
          // downloadAppliedJobDetails(fileContent, `${company}-${jobId}.txt`);
        }
      }

      localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));

      const updatedJobs = jobs.map((job) => ({
        ...job,
        applied: !!appliedJobs[company][job.id],
        appliedDate: appliedJobs[company][job.id]?.appliedDate,
        status: appliedJobs[company][job.id]?.status,
        considering: appliedJobs[company][job.id]?.considering,
      }));
      setJobs(updatedJobs);
    }
  };
  return (
    <div className='px-4 w-full scrollbar-hide flex flex-col items-center justify-center'>
      <h2 className='text-center font-semibold text-2xl'>
        Job listings for {currentCompany?.title} (
        {totalJobCount ? (
          totalJobCount
        ) : (
          <LoadingSpinner width='w-6' height='h-6' />
        )}
        )
      </h2>
      <div className='flex items-center justify-center'>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 items-center justify-center'>
          <LocationDropdown
            locations={dropdownCities}
            selectedLocations={selectedLocations.locations}
            onLocationChange={(id, isChecked) =>
              handleLocationChange(id, isChecked, 'locations')
            }
          />

          <button
            type='button'
            className='w-40 text-center'
            onClick={() => setSortOrder('newest')}
          >
            Sort by Newest
          </button>
          <button
            type='button'
            className='w-40 text-center'
            onClick={() => setSortOrder('oldest')}
          >
            Sort by Oldest
          </button>
          <button
            type='button'
            className='w-40 text-center'
            onClick={() => setSortOrder('')}
          >
            Reset Sort
          </button>
        </div>
      </div>
      <form
        onSubmit={handleSearchSubmit}
        className='w-full max-w-[673px] flex items-center justify-center shadow-md shadow-zinc-500 py-2 rounded-xl mb-2'
      >
        <input
          type='text'
          value={tempSearchText}
          onChange={(e) => setTempSearchText(e.target.value)}
          placeholder='Search jobs...'
          className='p-2 flex-1 active:outline-none focus:outline-none bg-transparent border-none text-slate-900'
        />
        <button
          type='submit'
          onClick={() => {
            setSearchText(tempSearchText);
            setOffset(0);
          }}
        >
          Search
        </button>
      </form>
      <div className='overflow-x-auto jobs-list-container'>
        <table className='min-w-full mt-4 border-collapse text-xs sm:text-base'>
          <thead>
            <tr className='bg-[#f4f4f4]'>
              <th className='border p-2'>Title</th>
              <th className='border p-2'>Last Updated</th>
              <th className='border p-2'>Location</th>
              <th className='border p-2'>Job Link</th>
              <th className='border p-2'>Applied</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }, (_, index) => (
                  <SingleJobPostingSkeletonRow key={index} cols={5} />
                ))
              : jobs?.jobPostings?.map((job: any, jobIndex: number) => (
                  <SinglePostingRow
                    key={jobIndex}
                    job={job}
                    onRowClick={() => fetchJobDetails(job.id)}
                    onToggleApply={() => handleApplicationToggle(job)}
                    baseUrl={currentCompany?.url}
                    workday={true}
                  />
                ))}
          </tbody>
        </table>
      </div>
      {/* <ul className='pt-2 jobs-list-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2'>
        {isLoading
          ? Array.from({ length: 10 }, (_, index) => (
              <li
                key={index}
                className='job-posting flex flex-col justify-between'
              >
                <JobPostingSkeleton />
              </li>
            ))
          : jobs?.jobPostings?.map((job: any, jobIndex: number) => (
              <li
                key={jobIndex}
                className='job-posting flex flex-col justify-between'
              >
                <WorkdayPosting
                  job={job}
                  baseUrl={currentCompany?.url}
                  appliedJobs={appliedJobs}
                  extractJobId={extractWorkdayJobId}
                />
                <span
                  onClick={() => toggleJobApplication(job)}
                  className={`hover:cursor-pointer hover:bg-slate-200 rounded-xl p-2 ${
                    appliedJobs[job.id] ? 'applied-button' : 'apply-button'
                  }`}
                >
                  {appliedJobs[job.id] ? '✔' : 'Apply'}
                </span>
              </li>
            ))}
      </ul> */}
      <section className='py-2 flex w-full justify-center md:gap-4 items-center shadow-lg'>
        <button
          type='button'
          onClick={() => setOffset(offset - 20)}
          className={`${offset === 0 ? 'hidden' : 'cursor-pointer'}`}
          disabled={offset === 0}
        >
          Previous
        </button>
        <button
          type='button'
          className={`${
            jobs?.jobPostings?.length < 20 ? 'hidden' : 'cursor-pointer'
          }`}
          onClick={() => setOffset(offset + 20)}
        >
          Next
        </button>
      </section>
    </div>
  );
};

export default WorkdayCompanyJobsList;

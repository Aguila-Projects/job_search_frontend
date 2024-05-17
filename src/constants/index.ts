const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
};

const API = {
  BASE_URL: 'http://localhost:8000/v1/api',
  COMPANIES: '/companies',
  JOBS: {
    BASE: '/jobs',
    GREENHOUSE: '/greenhouse',
    WORKDAY: '/workday',
    COMPANY: '/company',
    TODAY: '/todays-jobs',
  },
  APPLICATIONS: '/applications',
};

enum JobSourceEnum {
  GREENHOUSE = 'greenhouse',
  WORKDAY = 'workday',
}

export { ROUTES, API, JobSourceEnum };

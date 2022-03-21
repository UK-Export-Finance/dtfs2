const defaultUserDetails = {
  password: 'AbC!2345',
  email: 'test@testing.com',
  timezone: 'Europe/London',
};

export const UNDERWRITER_MANAGER_1 = {
  username: 'UNDERWRITER_MANAGER_1',
  teams: ['UNDERWRITER_MANAGERS'],
  firstName: 'Underwriter',
  lastName: 'Manager',
  ...defaultUserDetails,
};

export const BUSINESS_SUPPORT_USER_1 = {
  username: 'BUSINESS_SUPPORT_USER_1',
  teams: ['BUSINESS_SUPPORT'],
  firstName: 'Business',
  lastName: 'Support',
  ...defaultUserDetails,
};

export const T1_USER_1 = {
  username: 'T1_USER_1',
  teams: ['TEAM1'],
  firstName: 'T1',
  lastName: 'User1',
  ...defaultUserDetails,
};

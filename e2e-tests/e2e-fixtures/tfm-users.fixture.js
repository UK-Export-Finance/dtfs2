const defaultUserDetails = {
  password: 'AbC!2345',
  email: 'test@testing.com',
  timezone: 'Europe/London',
};

export const UNDERWRITER_MANAGER_1 = {
  username: 'UNDERWRITER_MANAGER_1',
  teams: [{ id: 'UNDERWRITER_MANAGERS' }],
  firstName: 'Benjamin',
  lastName: 'Jones',
  ...defaultUserDetails,
};

export const UNDERWRITER_MANAGER_2 = {
  username: 'UNDERWRITER_MANAGER_2',
  teams: [{ id: 'UNDERWRITER_MANAGERS' }],
  firstName: 'Jonathan',
  lastName: 'Roberts',
  ...defaultUserDetails,
};

export const UNDERWRITER_1 = {
  username: 'UNDERWRITER_1',
  teams: [{ id: 'UNDERWRITERS' }],
  firstName: 'Olivia',
  lastName: 'Williams',
  ...defaultUserDetails,
};

export const BUSINESS_SUPPORT_USER_1 = {
  username: 'BUSINESS_SUPPORT_USER_1',
  teams: [{ id: 'BUSINESS_SUPPORT' }],
  firstName: 'John',
  lastName: 'Davies',
  ...defaultUserDetails,
};

export const BUSINESS_SUPPORT_USER_2 = {
  username: 'BUSINESS_SUPPORT_USER_2',
  teams: [{ id: 'BUSINESS_SUPPORT' }],
  firstName: 'Sarah',
  lastName: 'Walker',
  ...defaultUserDetails,
};

export const T1_USER_1 = {
  username: 'T1_USER_1',
  teams: [{ id: 'TEAM1' }],
  firstName: 'Joe',
  lastName: 'Bloggs',
  ...defaultUserDetails,
};

export const RISK_MANAGER_1 = {
  username: 'RISK_MANAGER_1',
  teams: [{ id: 'RISK_MANAGERS' }],
  firstName: 'Steven',
  lastName: 'Robinson',
  ...defaultUserDetails,
};

export const UNDERWRITING_SUPPORT_1 = {
  username: 'UNDERWRITING_SUPPORT_1',
  teams: [{ id: 'UNDERWRITING_SUPPORT' }],
  firstName: 'Ben',
  lastName: 'Wilson',
  ...defaultUserDetails,
};

export const PIM_USER_1 = {
  username: 'PIM_USER_1',
  teams: [{ id: 'PIM' }, { id: 'BUSINESS_SUPPORT' }],
  firstName: 'Adam',
  lastName: 'Last',
  ...defaultUserDetails,
};

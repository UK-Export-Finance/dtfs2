export const BANK = {
  id: 'String',
  name: 'String',
  mga: 'Object',
  emails: 'Object',
  companiesHouseNo: 'String',
  partyUrn: 'String',
  hasGefAccessOnly: 'Boolean',
  paymentOfficerTeam: 'Object',
  utilisationReportPeriodSchedule: 'Object',
  isVisibleInTfmUtilisationReports: 'Boolean',
};

export const TFM = {
  USER: {
    username: 'String',
    email: 'String',
    password: 'String',
    teams: 'Object',
    timezone: 'String',
    firstName: 'String',
    lastName: 'String',
  },
  TEAM: {
    id: 'String',
    name: 'String',
    email: 'String',
  },
};

export const CRITERIA = {
  ELIGIBILITY: {
    version: 'Number',
    product: 'String',
    isInDraft: 'Boolean',
    createdAt: 'Number',
    criteria: 'Object',
  },
  MANDATORY: {
    DEFAULT: {
      version: 'Number',
      criteria: 'Object',
    },
    VERSIONED: {
      version: 'Number',
      isInDraft: 'Boolean',
      title: 'String',
      introText: 'String',
      criteria: 'Object',
      createdAt: 'String',
      updatedAt: 'Object',
    },
  },
};

/**
 * This is legacy verification.
 * If looking to add new verification, or add to these, consider
 * using the new verification system in `schemas/payload`.
 */

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
    salt: 'String',
    hash: 'String',
    teams: 'Object',
    timezone: 'String',
    firstName: 'String',
    lastName: 'String',
    status: 'String',
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

export const ACBS = {
  DEAL: {
    _id: 'String',
    dealSnapshot: 'Object',
    tfm: 'Object',
  },
  BANK: {
    id: 'String',
    name: 'String',
    partyUrn: 'String',
  },
};

import z from 'zod';

export const BANK = z.object({
  id: z.string(),
  name: z.string(),
  mga: z.array(z.string()),
  emails: z.array(z.string()),
  companiesHouseNo: z.string(),
  partyUrn: z.string(),
  hasGefAccessOnly: z.boolean(),
  paymentOfficerTeam: z.object({}),
  utilisationReportPeriodSchedule: z.array(z.object({})),
  isVisibleInTfmUtilisationReports: z.boolean(),
});

export const PORTAL = {
  USER: z.object({
    username: z.string(),
    firstname: z.string(),
    surname: z.string(),
    email: z.string(),
    timezone: z.string(),
    roles: z.array(z.string()),
    bank: z.object({}),
    'user-status': z.string(),
    salt: z.string(),
    hash: z.string(),
    auditRecord: z.object({}),
    isTrusted: z.boolean(),
  }),
};

export const TFM = {
  USER: z.object({
    username: z.string(),
    email: z.string(),
    password: z.string(),
    teams: z.array(z.string()),
    timezone: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  TEAM: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
};

export const CRITERIA = {
  ELIGIBILITY: z.object({
    version: z.number(),
    product: z.string(),
    isInDraft: z.boolean(),
    createdAt: z.number(),
    criteria: z.object({}),
  }),
  MANDATORY: {
    DEFAULT: z.object({
      version: z.number(),
      criteria: z.array(z.object({})),
    }),
    VERSIONED: z.object({
      version: z.number(),
      isInDraft: z.boolean(),
      title: z.string(),
      introText: z.string(),
      criteria: z.array(z.object({})),
      createdAt: z.string(),
      updatedAt: z.number({}),
    }),
  },
};

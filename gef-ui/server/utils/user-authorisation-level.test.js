import getUserAuthorisationLevelsToApplication from './user-authorisation-level';
import CONSTANTS from '../constants';
import { CHECKER, MAKER, READ_ONLY } from '../constants/roles';

const makerUser = {
  username: 'MAKER',
  firstname: 'mock',
  surname: 'mock',
  email: 'maker@ukexportfinance.gov.uk',
  roles: [MAKER],
  'user-status': 'active',
  _id: '11111',
};

const checkerUser = {
  username: 'CHECKER',
  firstname: 'mock',
  surname: 'Ker',
  email: 'checker@ukexportfinance.gov.uk',
  roles: [CHECKER],
  'user-status': 'active',
  _id: '11112',
};

const combinedUser = {
  username: 'COMBINED',
  firstname: 'mock',
  surname: 'mock',
  email: 'combined@ukexportfinance.gov.uk',
  roles: [MAKER, CHECKER],
  'user-status': 'active',
  _id: '11113',
};

const userWithoutMakerOrCheckerRole = {
  username: 'USER_WITHOUT_MAKER_OR_CHECKER',
  firstname: 'user without',
  surname: 'maker or checker',
  email: 'user-without-maker-or-checker@ukexportfinance.gov.uk',
  roles: [READ_ONLY],
  'user-status': 'active',
  _id: '11114',
};

const draftApplication = {
  _id: '123456789',
  maker: { name: 'mock-user' },
  status: CONSTANTS.DEAL_STATUS.DRAFT,
  bank: { id: '9' },
  exporter: {},
  bankInternalRefName: 'ref0001',
  mandatoryVersionId: null,
  createdAt: 1627035828247,
  updatedAt: null,
  additionalRefName: null,
};

const inProgressApplication = {
  ...draftApplication,
  status: CONSTANTS.DEAL_STATUS.IN_PROGRESS,
};

const bankCheckApplication = {
  ...draftApplication,
  status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL,
};

describe('user-authorisation-levels', () => {
  it('returns an empty array if the user does not have the maker or checker role', () => {
    expect(getUserAuthorisationLevelsToApplication(userWithoutMakerOrCheckerRole, draftApplication)).toEqual([]);
  });

  it('returns the expected authorisation levels for DRAFT', () => {
    expect(getUserAuthorisationLevelsToApplication(makerUser, draftApplication)).toEqual(['EDIT']);
    expect(getUserAuthorisationLevelsToApplication(checkerUser, draftApplication)).toEqual([]);
    expect(getUserAuthorisationLevelsToApplication(combinedUser, draftApplication)).toEqual(['EDIT']);
  });

  it('returns the expected authorisation levels for IN_PROGRESS', () => {
    expect(getUserAuthorisationLevelsToApplication(makerUser, inProgressApplication)).toEqual(['EDIT']);
    expect(getUserAuthorisationLevelsToApplication(checkerUser, inProgressApplication)).toEqual([]);
    expect(getUserAuthorisationLevelsToApplication(combinedUser, inProgressApplication)).toEqual(['EDIT']);
  });

  it('returns the expected authorisation levels for READY_FOR_APPROVAL', () => {
    expect(getUserAuthorisationLevelsToApplication(makerUser, bankCheckApplication)).toEqual(['READ', 'COMMENT']);
    expect(getUserAuthorisationLevelsToApplication(checkerUser, bankCheckApplication)).toEqual(['READ', 'COMMENT']);
    expect(getUserAuthorisationLevelsToApplication(combinedUser, bankCheckApplication)).toEqual(['READ', 'COMMENT']);
  });
});

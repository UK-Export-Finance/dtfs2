import CONSTANTS from '../constants';

import { isNotice, isUkefReviewAvailable, isUkefReviewPositive, makerCanReSubmit, isDealNotice } from './deal-helpers';

import { MOCK_AIN_APPLICATION, MOCK_BASIC_DEAL, MOCK_AIN_APPLICATION_UNISSUED_ONLY } from './mocks/mock-applications';

import { MOCK_REQUEST } from './mocks/mock-requests';

describe('isNotice()', () => {
  it('Should return TRUE for any `Notice` submission type i.e. MIN or AIN', () => {
    expect(isNotice('Manual inclusion notice')).toEqual(true);
  });

  it('Should return FALSE for any `Application` submission type i.e. MIA', () => {
    expect(isNotice('Manual inclusion application')).toEqual(false);
  });

  it('Should return FALSE for any `Application` submission type i.e. MIA with mixed case', () => {
    expect(isNotice('manUAL InClUsIoN APPLICATION')).toEqual(false);
  });
});

describe('isUkefReviewAvailable()', () => {
  it('Should return TRUE for application with UkefDecision set to `Accepted by UKEF (with conditions)` and status set to `Ready for Checkers approval`', () => {
    MOCK_BASIC_DEAL.ukefDecision = [
      {
        text: '1. Condition 1\r\n2. Condition 2\r\n3. Condition 3',
        decision: 'Accepted by UKEF (with conditions)',
        timestamp: 1639657163,
      },
    ];
    expect(isUkefReviewAvailable(MOCK_BASIC_DEAL.status, MOCK_BASIC_DEAL.ukefDecision)).toEqual(true);
  });

  it('Should return FALSE for application with no UkefDecision and status set to `Ready for Checkers approval`', () => {
    MOCK_BASIC_DEAL.ukefDecision = [];
    expect(isUkefReviewAvailable(MOCK_BASIC_DEAL.status, MOCK_BASIC_DEAL.ukefDecision)).toEqual(false);
  });
});

describe('isUkefReviewPositive()', () => {
  it('Should return TRUE for application with UkefDecision set to `Accepted by UKEF (with conditions)` and status set to `Ready for Checkers approval`', () => {
    MOCK_BASIC_DEAL.ukefDecision = [
      {
        text: '1. Condition 1\r\n2. Condition 2\r\n3. Condition 3',
        decision: 'Accepted by UKEF (with conditions)',
        timestamp: 1639657163,
      },
    ];
    expect(isUkefReviewPositive(MOCK_BASIC_DEAL.status, MOCK_BASIC_DEAL.ukefDecision)).toEqual(true);
  });

  it('Should return FALSE for application with UkefDecision set to `Rejected by UKEF` and status set to `Ready for Checkers approval`', () => {
    MOCK_BASIC_DEAL.ukefDecision = [
      {
        text: '1. Condition 1\r\n2. Condition 2\r\n3. Condition 3',
        decision: 'Rejected by UKEF',
        timestamp: 1639657163,
      },
    ];
    expect(isUkefReviewPositive(MOCK_BASIC_DEAL.status, MOCK_BASIC_DEAL.ukefDecision)).toEqual(false);
  });

  it('Should return FALSE for application with no UkefDecision and status set to `Ready for Checkers approval`', () => {
    MOCK_BASIC_DEAL.ukefDecision = [];
    expect(isUkefReviewPositive(MOCK_BASIC_DEAL.status, MOCK_BASIC_DEAL.ukefDecision)).toEqual(false);
  });

  it('Should return TRUE for application with UkefDecision set to `Accepted by UKEF (with conditions)` and status set to UKEF_APPROVED_WITHOUT_CONDITIONS status', () => {
    const UKEF_APPPROVED_DEAL = MOCK_BASIC_DEAL;
    UKEF_APPPROVED_DEAL.status = CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
    UKEF_APPPROVED_DEAL.ukefDecision = [
      {
        text: '1. Condition 1\r\n2. Condition 2\r\n3. Condition 3',
        decision: 'Accepted by UKEF (with conditions)',
        timestamp: 1639657163,
      },
    ];
    expect(isUkefReviewPositive(UKEF_APPPROVED_DEAL.status, UKEF_APPPROVED_DEAL.ukefDecision)).toEqual(true);
  });
});

describe('makerCanReSubmit', () => {
  it('Should return FALSE since the deal status is READY_FOR_APPROVAL', () => {
    MOCK_BASIC_DEAL.status = CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL;
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_BASIC_DEAL)).toEqual(false);
  });
  it('Should return TRUE as the deal status has been changed to UKEF_APPROVED_WITH_CONDITIONS and ukefDecisionAccepted is true', () => {
    const mockDeal = MOCK_BASIC_DEAL;
    mockDeal.status = CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    mockDeal.ukefDecisionAccepted = true;
    expect(makerCanReSubmit(MOCK_REQUEST, mockDeal)).toEqual(true);
  });
  it('Should return TRUE as the deal has changed facilities, is AIN and has status UKEF_ACKNOWLEDGED', () => {
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_AIN_APPLICATION)).toEqual(true);
  });
  it('Should return FALSE as the deal does not have changed facilities, is AIN and has status UKEF_ACKNOWLEDGED', () => {
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_AIN_APPLICATION_UNISSUED_ONLY)).toEqual(false);
  });
});

describe('isDealNotice()', () => {
  it('Should return TRUE for any `Notice` submission type i.e. MIN or AIN with UKEF decision not reviewed', () => {
    expect(isDealNotice(false, 'Manual inclusion notice')).toEqual(true);
  });

  it('Should return FALSE for any `Application` submission type i.e. MIA with UKEF Decision not yet reviewed', () => {
    expect(isDealNotice(false, 'Manual inclusion application')).toEqual(false);
  });

  it('Should return TRUE for application with UKEF Decision accepted and application is still an MIA', () => {
    expect(isDealNotice(true, 'Manual inclusion application')).toEqual(true);
  });

  it('Should return TRUE for application with UKEF Decision accepted and application is MIN', () => {
    expect(isDealNotice(true, 'Manual inclusion notice')).toEqual(true);
  });
});

const api = require('../api');
const {
  sendManualDecisionAmendmentEmail,
  sendFirstTaskEmail,
  calculateNewFacilityValue,
  calculateUkefExposure,
  calculateAmendmentExposure,
  calculateAmendmentDateTenor,
  addLatestAmendmentDates,
  addLatestAmendmentValue,
  internalAmendmentEmail,
} = require('./amendment.helpers');
const CONSTANTS = require('../../constants');
const { CURRENCY } = require('../../constants/currency.constant');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../constants/deals');
const { FACILITY_TYPE } = require('../../constants/facilities');
const { formattedNumber } = require('../../utils/number');

const amendmentVariables = require('../__mocks__/amendmentVariables');

const MOCK_NOTIFY_EMAIL_RESPONSE = require('../__mocks__/mock-notify-email-response');

describe('sendManualDecisionAmendmentEmail()', () => {
  const sendEmailApiSpy = jest.fn(() => Promise.resolve(
    MOCK_NOTIFY_EMAIL_RESPONSE,
  ));

  const updateFacilityAmendmentSpy = jest.fn(() => Promise.resolve({}));

  beforeEach(async () => {
    sendEmailApiSpy.mockClear();
    updateFacilityAmendmentSpy.mockClear();

    api.sendEmail = sendEmailApiSpy;
    api.updateFacilityAmendment = updateFacilityAmendmentSpy;
  });

  it('should send approved without conditions email with correct details for both amendments', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithoutConditionsBothAmendments);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS,
      amendmentVariables.approvedWithoutConditionsBothAmendments.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithoutConditionsBothAmendments.facilityId,
      amendmentVariables.approvedWithoutConditionsBothAmendments.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved without conditions email with correct details for both amendments if BSS', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithoutConditionsBothAmendmentsBSS);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS,
      amendmentVariables.approvedWithoutConditionsBothAmendments.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithoutConditionsBothAmendments.facilityId,
      amendmentVariables.approvedWithoutConditionsBothAmendments.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved without conditions email with correct details for a single amendment change', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithoutConditionsOneAmendment);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS,
      amendmentVariables.approvedWithoutConditionsOneAmendment.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithoutConditionsOneAmendment.facilityId,
      amendmentVariables.approvedWithoutConditionsOneAmendment.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved with conditions email with correct details for both amendments being approved w/ conditions', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithConditionsBothAmendments);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS,
      amendmentVariables.approvedWithConditionsBothAmendments.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        conditions: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithConditionsBothAmendments.facilityId,
      amendmentVariables.approvedWithConditionsBothAmendments.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved with conditions email with correct details for both amendments being approved w/ conditions when BSS', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithConditionsBothAmendmentsBSS);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS,
      amendmentVariables.approvedWithConditionsBothAmendments.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        conditions: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithConditionsBothAmendments.facilityId,
      amendmentVariables.approvedWithConditionsBothAmendments.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved without conditions email with correct details for a single amendment change being approved w/ conditions', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithConditionsOneAmendment);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS,
      amendmentVariables.approvedWithConditionsOneAmendment.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        conditions: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithConditionsOneAmendment.facilityId,
      amendmentVariables.approvedWithConditionsOneAmendment.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved with conditions email with correct details for both amendments being approved w/ conditions and approved w/o conditions', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithWithoutConditionsBothAmendments);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS,
      amendmentVariables.approvedWithWithoutConditionsBothAmendments.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        conditions: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithWithoutConditionsBothAmendments.facilityId,
      amendmentVariables.approvedWithWithoutConditionsBothAmendments.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved with conditions declined email with correct details for both amendments being approved w/ conditions and declined', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithConditionsDeclined);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS_DECLINED,
      amendmentVariables.approvedWithConditionsDeclined.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        conditions: expect.any(String),
        declined: expect.any(String),
        amendmentTypeApproved: CONSTANTS.DEALS.AMENDMENT_TYPE.VALUE,
        amendmentTypeDeclined: CONSTANTS.DEALS.AMENDMENT_TYPE.COVER_END_DATE,
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithConditionsDeclined.facilityId,
      amendmentVariables.approvedWithConditionsDeclined.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved with conditions declined email with correct details for both amendments being approved w/ conditions and declined', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithConditionsDeclinedSwapped);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS_DECLINED,
      amendmentVariables.approvedWithConditionsDeclinedSwapped.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        conditions: expect.any(String),
        declined: expect.any(String),
        amendmentTypeApproved: CONSTANTS.DEALS.AMENDMENT_TYPE.COVER_END_DATE,
        amendmentTypeDeclined: CONSTANTS.DEALS.AMENDMENT_TYPE.VALUE,
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithConditionsDeclinedSwapped.facilityId,
      amendmentVariables.approvedWithConditionsDeclinedSwapped.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved without conditions declined email with correct details for both amendments being approved wo/ conditions and declined', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithoutConditionsDeclined);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS_DECLINED,
      amendmentVariables.approvedWithoutConditionsDeclined.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        declined: expect.any(String),
        amendmentTypeApproved: CONSTANTS.DEALS.AMENDMENT_TYPE.VALUE,
        amendmentTypeDeclined: CONSTANTS.DEALS.AMENDMENT_TYPE.COVER_END_DATE,
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithoutConditionsDeclined.facilityId,
      amendmentVariables.approvedWithoutConditionsDeclined.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send approved without conditions declined email with correct details for both amendments being approved wo/ conditions and declined', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.approvedWithoutConditionsDeclinedSwapped);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS_DECLINED,
      amendmentVariables.approvedWithoutConditionsDeclinedSwapped.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        declined: expect.any(String),
        amendmentTypeApproved: CONSTANTS.DEALS.AMENDMENT_TYPE.COVER_END_DATE,
        amendmentTypeDeclined: CONSTANTS.DEALS.AMENDMENT_TYPE.VALUE,
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithoutConditionsDeclinedSwapped.facilityId,
      amendmentVariables.approvedWithoutConditionsDeclinedSwapped.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send declined email with correct details for both amendments being declined', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.declinedBothAmendments);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_DECLINED,
      amendmentVariables.declinedBothAmendments.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        declined: amendmentVariables.declinedBothAmendments.amendment.ukefDecision.declined,
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.declinedBothAmendments.facilityId,
      amendmentVariables.declinedBothAmendments.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should send declined email with correct details for one amendment change only being declined', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.declinedOneAmendment);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_DECLINED,
      amendmentVariables.declinedOneAmendment.user.email,
      {
        bankReferenceNumber: expect.any(String),
        exporterName: expect.any(String),
        recipientName: expect.any(String),
        ukefDealId: expect.any(String),
        ukefFacilityId: expect.any(String),
        declined: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.declinedOneAmendment.facilityId,
      amendmentVariables.declinedOneAmendment.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should not call APIs if does not meet any conditions', async () => {
    // does not have correct values for value and coverEndDate
    await sendManualDecisionAmendmentEmail(amendmentVariables.wrongAmendments);

    expect(sendEmailApiSpy).not.toHaveBeenCalled();

    expect(updateFacilityAmendmentSpy).not.toHaveBeenCalled();
  });
});

describe('sendFirstTaskEmail()', () => {
  const sendEmailApiSpy = jest.fn(() => Promise.resolve(
    MOCK_NOTIFY_EMAIL_RESPONSE,
  ));

  const updateFacilityAmendmentSpy = jest.fn(() => Promise.resolve({}));

  beforeEach(async () => {
    sendEmailApiSpy.mockClear();
    updateFacilityAmendmentSpy.mockClear();

    api.sendEmail = sendEmailApiSpy;
    api.updateFacilityAmendment = updateFacilityAmendmentSpy;
    api.findOneTeam = jest.fn(() => Promise.resolve({ email: 'test@test.com' }));
  });

  it('should send first task email with corrrect variables with gef deal', async () => {
    await sendFirstTaskEmail(amendmentVariables.firstTaskVariables);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
      amendmentVariables.approvedWithoutConditionsBothAmendments.user.email,
      {
        exporterName: expect.any(String),
        taskUrl: expect.any(String),
        ukefDealId: expect.any(String),
        taskTitle: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithoutConditionsBothAmendments.facilityId,
      amendmentVariables.approvedWithoutConditionsBothAmendments.amendmentId,
      { firstTaskEmailSent: true },
    );
  });

  it('should send first task email with corrrect variables with bss deal', async () => {
    const { firstTaskVariables } = amendmentVariables;
    firstTaskVariables.dealSnapshot.ukefDealId = null;
    firstTaskVariables.dealSnapshot.details = { ukefDealId: '123' };

    await sendFirstTaskEmail(firstTaskVariables);

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
      amendmentVariables.approvedWithoutConditionsBothAmendments.user.email,
      {
        exporterName: expect.any(String),
        taskUrl: expect.any(String),
        ukefDealId: expect.any(String),
        taskTitle: expect.any(String),
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.approvedWithoutConditionsBothAmendments.facilityId,
      amendmentVariables.approvedWithoutConditionsBothAmendments.amendmentId,
      { firstTaskEmailSent: true },
    );
  });

  it('should not call APIs if does not meet any conditions', async () => {
    // does not have correct values for value and coverEndDate
    await sendFirstTaskEmail(amendmentVariables.noTaskVariables);

    expect(sendEmailApiSpy).not.toHaveBeenCalled();

    expect(updateFacilityAmendmentSpy).not.toHaveBeenCalled();
  });
});

describe('calculateNewFacilityValue()', () => {
  const amendment = { currency: CURRENCY.GBP };

  it('should return the same number since in GBP', () => {
    amendment.value = 25000;

    const result = calculateNewFacilityValue(null, amendment);
    const expected = amendment.value;
    expect(result).toEqual(expected);
  });

  it('should return a number if different currency', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = 7.1;

    const result = calculateNewFacilityValue(exchangeRate, amendment);
    const expected = amendment.value * exchangeRate;
    expect(result).toEqual(expected);
  });

  it('should return null if no facility value or currency in amendment', () => {
    amendment.value = null;
    amendment.currency = null;
    const exchangeRate = 7.1;

    const result = calculateNewFacilityValue(exchangeRate, amendment);
    expect(result).toBeNull();
  });

  it('should return null if no exchange rate if currency not GBP', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = null;

    const result = calculateNewFacilityValue(exchangeRate, amendment);
    expect(result).toBeNull();
  });
});

describe('calculateUkefExposure()', () => {
  it('should return the cover percentage without rounding when not needed', () => {
    const facilityValueInGBP = '5000';
    const coverPercentage = 80;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    const expected = 5000 * (80 / 100);
    expect(result).toEqual(expected);
  });

  it('should return a rounded number when more than 2 decimal places', () => {
    const facilityValueInGBP = '5165.2';
    const coverPercentage = 33;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    const expected = 1704.52;
    expect(result).toEqual(expected);
  });

  it('should return null if no facility value', () => {
    const facilityValueInGBP = null;
    const coverPercentage = 33;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });

  it('should return null if no cover percentage', () => {
    const facilityValueInGBP = '5165.2';
    const coverPercentage = null;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });

  it('should return null if no cover percentage and facility value', () => {
    const facilityValueInGBP = null;
    const coverPercentage = null;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });
});

describe('calculateAmendmentExposure', () => {
  const mockAmendment = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
    requireUkefApproval: true,
    submittedAt: 1660047717,
    ukefDecision: {
      submitted: true,
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
    },
    bankDecision: {
      decision: AMENDMENT_BANK_DECISION.PROCEED,
      submittedAt: 1660047717,
      effectiveDate: 1650047717,
    },
  };
  const mockAmendmentValueResponse = {
    value: 5000,
    currency: CURRENCY.GBP,
  };

  const facilitySnapshot = {
    coverPercentage: 12,
    _id: '1',
  };

  const mockFacility = {
    _id: '1',
    facilitySnapshot,
    tfm: {
      exchangeRate: 1.2,
    },
  };

  it('should return null if no facility response', async () => {
    api.findOneFacility = () => Promise.resolve({});
    api.getAmendmentById = () => Promise.resolve(mockAmendment);

    const result = await calculateAmendmentExposure(mockAmendment.amendmentId, mockFacility._id, mockAmendmentValueResponse);

    expect(result).toBeNull();
  });

  it('should return null if no amendment response', async () => {
    api.findOneFacility = () => Promise.resolve({});
    api.getAmendmentById = () => Promise.resolve(mockAmendment);

    const result = await calculateAmendmentExposure(mockAmendment.amendmentId, mockFacility._id, mockAmendmentValueResponse);

    expect(result).toBeNull();
  });

  it('should return exposure when has amendment and facility with timestamp as effective date', async () => {
    api.findOneFacility = () => Promise.resolve(mockFacility);
    api.getAmendmentById = () => Promise.resolve(mockAmendment);

    const result = await calculateAmendmentExposure(mockAmendment.amendmentId, mockFacility._id, mockAmendmentValueResponse);

    const exposureValue = mockAmendment.value * (mockFacility.facilitySnapshot.coverPercentage / 100);

    const formattedUkefExposure = formattedNumber(exposureValue);

    const timestampValue = new Date(mockAmendment.bankDecision.effectiveDate * 1000).valueOf();

    const expected = {
      exposure: formattedUkefExposure,
      timestamp: timestampValue,
      ukefExposureValue: exposureValue,
    };

    expect(result).toEqual(expected);
  });

  it('should return exposure when has amendment and facility with timestamp as effective date and is not in GBP', async () => {
    api.findOneFacility = () => Promise.resolve(mockFacility);
    api.getAmendmentById = () => Promise.resolve(mockAmendment);

    const mockValueResponseJPY = {
      currency: CURRENCY.JPY,
      value: 5000,
    };

    const result = await calculateAmendmentExposure(mockAmendment.amendmentId, mockFacility._id, mockValueResponseJPY);

    const valueInGBP = calculateNewFacilityValue(mockFacility.tfm.exchangeRate, mockValueResponseJPY);

    const exposureValue = valueInGBP * (mockFacility.facilitySnapshot.coverPercentage / 100);

    const formattedUkefExposure = formattedNumber(exposureValue);

    const timestampValue = new Date(mockAmendment.bankDecision.effectiveDate * 1000).valueOf();

    const expected = {
      exposure: formattedUkefExposure,
      timestamp: timestampValue,
      ukefExposureValue: exposureValue,
    };

    expect(result).toEqual(expected);
  });
});

describe('calculateAmendmentDateTenor()', () => {
  const coverEndDateUnix = 1658403289;

  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '06',
    'coverEndDate-year': '2022',
  };

  const mockCoverStartDate = {
    'requestedCoverStartDate-year': '2022',
    'requestedCoverStartDate-month': '5',
    'requestedCoverStartDate-day': '1',
  };

  const mockFacility = {
    facilitySnapshot: {
      _id: '1',
      facilityStage: '',
      monthsOfCover: 12,
      requestedCoverStartDate: '2021-12-08T00:00:00.000Z',
      ...mockCoverEndDate,
      ...mockCoverStartDate,
      ukefFacilityType: FACILITY_TYPE.BOND,
    },
    tfm: {
      exposurePeriodInMonths: 12,
    },
  };

  it('should return null when no response from exposure period API', async () => {
    api.getFacilityExposurePeriod = () => Promise.resolve({});

    const result = await calculateAmendmentDateTenor(coverEndDateUnix, mockFacility);

    expect(result).toBeNull();
  });

  it('should return null when no facility provided', async () => {
    const result = await calculateAmendmentDateTenor(coverEndDateUnix, {});

    expect(result).toBeNull();
  });

  it('should return tenor from amendment when exposure API returns a response', async () => {
    api.getFacilityExposurePeriod = () => Promise.resolve({ exposurePeriodInMonths: 2 });

    const result = await calculateAmendmentDateTenor(coverEndDateUnix, mockFacility);

    const expected = 2;

    expect(result).toEqual(expected);
  });
});

describe('addLatestAmendmentDates', () => {
  const latestDateResponse = {
    coverEndDate: 1658403289,
  };
  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '06',
    'coverEndDate-year': '2022',
  };

  const mockCoverStartDate = {
    'requestedCoverStartDate-year': '2022',
    'requestedCoverStartDate-month': '5',
    'requestedCoverStartDate-day': '1',
  };

  const mockFacility = {
    facilitySnapshot: {
      _id: '1',
      facilityStage: '',
      monthsOfCover: 12,
      requestedCoverStartDate: '2021-12-08T00:00:00.000Z',
      ...mockCoverEndDate,
      ...mockCoverStartDate,
      ukefFacilityType: FACILITY_TYPE.BOND,
    },
    tfm: {
      exposurePeriodInMonths: 12,
    },
  };

  it('should return empty object when no coverEndDate', async () => {
    const response = await addLatestAmendmentDates({}, {}, '123');

    expect(response).toEqual({});
  });

  it('should return empty object when no facility response', async () => {
    api.getFacilityExposurePeriod = () => Promise.resolve({ exposurePeriodInMonths: 2 });
    api.findOneFacility = () => Promise.resolve(null);

    const response = await addLatestAmendmentDates({}, latestDateResponse, '123');

    expect(response).toEqual({});
  });

  it('should return populated object correct parameters and api calls are made', async () => {
    api.getFacilityExposurePeriod = () => Promise.resolve({ exposurePeriodInMonths: 2 });
    api.findOneFacility = () => Promise.resolve(mockFacility);

    const response = await addLatestAmendmentDates({}, latestDateResponse, '123');

    const expected = {
      coverEndDate: latestDateResponse.coverEndDate,
      amendmentExposurePeriodInMonths: 2,
    };

    expect(response).toEqual(expected);
  });
});

describe('addLatestAmendmentValue()', () => {
  const valueResponse = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1',
  };

  const mockAmendment = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
    requireUkefApproval: true,
    submittedAt: 1660047717,
    ukefDecision: {
      submitted: true,
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
    },
    bankDecision: {
      decision: AMENDMENT_BANK_DECISION.PROCEED,
      submittedAt: 1660047717,
      effectiveDate: 1650047717,
    },
  };

  const facilitySnapshot = {
    coverPercentage: 12,
    _id: '1',
  };

  const mockFacility = {
    _id: '1',
    facilitySnapshot,
    tfm: {
      exchangeRate: 1.2,
    },
  };

  it('should return empty object when no latestValue', async () => {
    const response = await addLatestAmendmentValue({}, {}, '1234');

    expect(response).toEqual({});
  });

  it('should return object with null for exposure when no API responses', async () => {
    api.getAmendmentById = () => Promise.resolve({});
    api.findOneFacility = () => Promise.resolve({});

    const response = await addLatestAmendmentValue({}, valueResponse, '1234');

    const expected = {
      exposure: null,
      value: {
        currency: CURRENCY.GBP,
        value: 5000,
      },
    };
    expect(response).toEqual(expected);
  });

  it('should return fully populated object with null when API responses and all correct parameters', async () => {
    api.getAmendmentById = () => Promise.resolve(mockAmendment);
    api.findOneFacility = () => Promise.resolve(mockFacility);

    const response = await addLatestAmendmentValue({}, valueResponse, '1234');

    const expected = {
      exposure: {
        exposure: '600.00',
        timestamp: 1650047717000,
        ukefExposureValue: 600,
      },
      value: {
        currency: CURRENCY.GBP,
        value: 5000,
      },
    };
    expect(response).toEqual(expected);
  });
});

/**
 * UKEF internal email notification upon
 * a facility amendment submission unit
 * test cases.
 */
describe('internalAmendmentEmail()', () => {
  const sendEmailApiSpy = jest.fn(() => Promise.resolve(
    MOCK_NOTIFY_EMAIL_RESPONSE,
  ));

  beforeEach(async () => {
    sendEmailApiSpy.mockClear();
    api.sendEmail = sendEmailApiSpy;
  });

  it('Should return false void UKEF Facility ID', async () => {
    const response = await internalAmendmentEmail('');
    expect(response).toEqual(false);
  });

  it('Should return expect object on a correct UKEF Facility ID', async () => {
    const response = await internalAmendmentEmail('1234567');
    expect(response).toEqual(expect.any(Object));
  });

  it('Should call the expected function with expected arguments set', async () => {
    await internalAmendmentEmail('1234567');

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      CONSTANTS.EMAIL_TEMPLATE_IDS.INTERNAL_AMENDMENT_NOTIFICATION,
      expect.any(String),
      {
        ukefFacilityId: '1234567',
      },
    );
  });
});

const api = require('../api');
const { sendManualDecisionAmendmentEmail, sendFirstTaskEmail } = require('./amendment.helpers');
const CONSTANTS = require('../../constants');
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

  it('should send approved without conditions email with correct details for both amendments', async () => {
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

  it('should not call APIs if does not meet any conditions', async () => {
    // does not have correct values for value and coverEndDate
    await sendFirstTaskEmail(amendmentVariables.noTaskVariables);

    expect(sendEmailApiSpy).not.toHaveBeenCalled();

    expect(updateFacilityAmendmentSpy).not.toHaveBeenCalled();
  });
});

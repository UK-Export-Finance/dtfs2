const api = require('../api');
const { sendManualDecisionAmendmentEmail } = require('./amendment.helpers');
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
        bankReferenceNumber: amendmentVariables.approvedWithoutConditionsBothAmendments.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithoutConditionsBothAmendments.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithoutConditionsBothAmendments.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithoutConditionsBothAmendments.amendment.ukefFacilityId,
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
        bankReferenceNumber: amendmentVariables.approvedWithoutConditionsOneAmendment.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithoutConditionsOneAmendment.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithoutConditionsOneAmendment.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithoutConditionsOneAmendment.amendment.ukefFacilityId,
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
        bankReferenceNumber: amendmentVariables.approvedWithConditionsBothAmendments.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithConditionsBothAmendments.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithConditionsBothAmendments.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithConditionsBothAmendments.amendment.ukefFacilityId,
        conditions: amendmentVariables.approvedWithConditionsBothAmendments.amendment.ukefDecision.conditions,
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
        bankReferenceNumber: amendmentVariables.approvedWithConditionsOneAmendment.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithConditionsOneAmendment.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithConditionsOneAmendment.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithConditionsOneAmendment.amendment.ukefFacilityId,
        conditions: amendmentVariables.approvedWithConditionsOneAmendment.amendment.ukefDecision.conditions,
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
        bankReferenceNumber: amendmentVariables.approvedWithWithoutConditionsBothAmendments.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithWithoutConditionsBothAmendments.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithWithoutConditionsBothAmendments.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithWithoutConditionsBothAmendments.amendment.ukefFacilityId,
        conditions: amendmentVariables.approvedWithWithoutConditionsBothAmendments.amendment.ukefDecision.conditions,
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
        bankReferenceNumber: amendmentVariables.approvedWithConditionsDeclined.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithConditionsDeclined.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithConditionsDeclined.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithConditionsDeclined.amendment.ukefFacilityId,
        conditions: amendmentVariables.approvedWithConditionsDeclined.amendment.ukefDecision.conditions,
        declined: amendmentVariables.approvedWithConditionsDeclined.amendment.ukefDecision.declined,
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
        bankReferenceNumber: amendmentVariables.approvedWithConditionsDeclinedSwapped.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithConditionsDeclinedSwapped.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithConditionsDeclinedSwapped.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithConditionsDeclinedSwapped.amendment.ukefFacilityId,
        conditions: amendmentVariables.approvedWithConditionsDeclinedSwapped.amendment.ukefDecision.conditions,
        declined: amendmentVariables.approvedWithConditionsDeclinedSwapped.amendment.ukefDecision.declined,
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
        bankReferenceNumber: amendmentVariables.approvedWithoutConditionsDeclined.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithoutConditionsDeclined.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithoutConditionsDeclined.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithoutConditionsDeclined.amendment.ukefFacilityId,
        declined: amendmentVariables.approvedWithoutConditionsDeclined.amendment.ukefDecision.declined,
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
        bankReferenceNumber: amendmentVariables.approvedWithoutConditionsDeclinedSwapped.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.approvedWithoutConditionsDeclinedSwapped.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.approvedWithoutConditionsDeclinedSwapped.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.approvedWithoutConditionsDeclinedSwapped.amendment.ukefFacilityId,
        declined: amendmentVariables.approvedWithoutConditionsDeclinedSwapped.amendment.ukefDecision.declined,
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
        bankReferenceNumber: amendmentVariables.declinedBothAmendments.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.declinedBothAmendments.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.declinedBothAmendments.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.declinedBothAmendments.amendment.ukefFacilityId,
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
        bankReferenceNumber: amendmentVariables.declinedOneAmendment.dealSnapshot.bankInternalRefName,
        exporterName: amendmentVariables.declinedOneAmendment.dealSnapshot.exporter.companyName,
        recipientName: 'Bob Smith',
        ukefDealId: amendmentVariables.declinedOneAmendment.dealSnapshot.ukefDealId,
        ukefFacilityId: amendmentVariables.declinedOneAmendment.amendment.ukefFacilityId,
        declined: amendmentVariables.declinedOneAmendment.amendment.ukefDecision.declined,
      },
    );

    expect(updateFacilityAmendmentSpy).toHaveBeenCalledWith(
      amendmentVariables.declinedOneAmendment.facilityId,
      amendmentVariables.declinedOneAmendment.amendmentId,
      { ukefDecision: { managersDecisionEmailSent: true } },
    );
  });

  it('should not call APIs if does not meet any conditions', async () => {
    await sendManualDecisionAmendmentEmail(amendmentVariables.wrongAmendments);

    expect(sendEmailApiSpy).not.toHaveBeenCalled();

    expect(updateFacilityAmendmentSpy).not.toHaveBeenCalled();
  });
});

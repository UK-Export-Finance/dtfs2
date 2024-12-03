const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
const api = require('../api');
const CONSTANTS = require('../../constants');
const { updatePortalDealStatus } = require('./update-portal-deal-status');

describe('updatePortalDealStatus', () => {
  const updatePortalBssDealStatusMock = jest.spyOn(api, 'updatePortalBssDealStatus');
  updatePortalBssDealStatusMock.mockResolvedValue();

  const updatePortalGefDealStatusMock = jest.spyOn(api, 'updatePortalGefDealStatus');
  updatePortalGefDealStatusMock.mockResolvedValue();

  const auditDetails = generatePortalAuditDetails(new ObjectId());

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should update portal deal status to IN_PROGRESS_BY_UKEF for MIA submission type and BSS_EWCS deal type', async () => {
    const deal = {
      _id: 'dealId',
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
    };

    const result = await updatePortalDealStatus(deal, auditDetails);

    expect(updatePortalBssDealStatusMock).toHaveBeenCalledWith({
      auditDetails,
      dealId: 'dealId',
      status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.IN_PROGRESS_BY_UKEF,
    });
    expect(result).toEqual(deal);
  });

  it('should update portal deal status to UKEF_ACKNOWLEDGED for AIN submission type and GEF deal type', async () => {
    const deal = {
      _id: 'dealId',
      dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
    };

    const result = await updatePortalDealStatus(deal, auditDetails);

    expect(updatePortalGefDealStatusMock).toHaveBeenCalledWith({
      auditDetails,
      dealId: 'dealId',
      status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
    });
    expect(result).toEqual(deal);
  });

  it('should update portal deal status to UKEF_ACKNOWLEDGED for MIN submission type and GEF deal type', async () => {
    const deal = {
      _id: 'dealId',
      dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
    };

    const result = await updatePortalDealStatus(deal, auditDetails);

    expect(updatePortalGefDealStatusMock).toHaveBeenCalledWith({
      auditDetails,
      dealId: 'dealId',
      status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
    });
    expect(result).toEqual(deal);
  });

  it('should log an error message and return the original deal object for invalid submission type', async () => {
    const deal = {
      _id: 'dealId',
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      submissionType: 'invalid',
    };

    const consoleErrorMock = jest.spyOn(console, 'error');
    consoleErrorMock.mockImplementation();

    const result = await updatePortalDealStatus(deal, auditDetails);

    expect(updatePortalBssDealStatusMock).not.toHaveBeenCalled();

    expect(consoleErrorMock).toHaveBeenCalledWith('Cannot update portal deal %s status for submission type %s', 'dealId', 'invalid');
    expect(result).toEqual(deal);
  });

  it('should not update portal deal status and return the original deal object for invalid deal type', async () => {
    const deal = {
      _id: 'dealId',
      dealType: 'invalid',
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
    };

    expect(updatePortalBssDealStatusMock).not.toHaveBeenCalled();
    expect(updatePortalGefDealStatusMock).not.toHaveBeenCalled();

    const result = await updatePortalDealStatus(deal, auditDetails);

    expect(result).toEqual(deal);
  });

  it('should not update portal deal status and return the original deal object for invalid deal type', async () => {
    const deal = {
      _id: 'dealId',
      dealType: 'invalid',
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
    };

    expect(updatePortalBssDealStatusMock).not.toHaveBeenCalled();
    expect(updatePortalGefDealStatusMock).not.toHaveBeenCalled();

    const result = await updatePortalDealStatus(deal, auditDetails);

    expect(result).toEqual(deal);
  });

  it('should not update portal deal status and return the original deal object for invalid deal type', async () => {
    const deal = {
      _id: 'dealId',
      dealType: 'invalid',
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
    };

    expect(updatePortalBssDealStatusMock).not.toHaveBeenCalled();
    expect(updatePortalGefDealStatusMock).not.toHaveBeenCalled();

    const result = await updatePortalDealStatus(deal, auditDetails);

    expect(result).toEqual(deal);
  });

  it('should not update portal deal status and throw an error by returning the original deal object for invalid deal and submission type', async () => {
    const deal = {
      _id: 'dealId',
      dealType: 'invalid',
      submissionType: 'invalid',
    };

    const consoleErrorMock = jest.spyOn(console, 'error');
    consoleErrorMock.mockImplementation();

    const result = await updatePortalDealStatus(deal, auditDetails);

    expect(updatePortalBssDealStatusMock).not.toHaveBeenCalled();
    expect(updatePortalGefDealStatusMock).not.toHaveBeenCalled();

    expect(consoleErrorMock).toHaveBeenCalledWith('Cannot update portal deal %s status for submission type %s', 'dealId', 'invalid');
    expect(result).toEqual(deal);
  });
});

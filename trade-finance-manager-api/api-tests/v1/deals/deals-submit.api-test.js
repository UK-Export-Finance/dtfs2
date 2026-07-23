const { HttpStatusCode } = require('axios');
const { DEAL_SUBMISSION_TYPE, DEAL_TYPE, CURRENCY } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../../../server/v1/api');
const acbsController = require('../../../server/v1/controllers/acbs.controller');
const { canSendToApimGift, sendFacilitiesToApimGift } = require('../../../server/v1/integrations/apim-gift');
const { submitDeal, createSubmitBody } = require('../../helpers/submitDeal');
const mapSubmittedDeal = require('../../../server/v1/mappings/map-submitted-deal');
const addTfmDealData = require('../../../server/v1/controllers/deal-add-tfm-data');
const { createDealTasks } = require('../../../server/v1/controllers/deal.tasks');
const generateDateReceived = require('../../../server/v1/controllers/deal-add-tfm-data/dateReceived');
const { mockFindOneDeal, mockUpdateDeal } = require('../../../server/v1/__mocks__/common-api-mocks');
const CONSTANTS = require('../../../server/constants');
const { MOCK_BSS_EWCS_DEAL } = require('../../../server/v1/__mocks__/mock-deal');
const MOCK_BSS_EWCS_DEAL_MIN = require('../../../server/v1/__mocks__/mock-deal-MIN');
const MOCK_BSS_EWCS_DEAL_MIA = require('../../../server/v1/__mocks__/mock-deal-MIA-not-submitted');
const MOCK_BSS_EWCS_DEAL_NO_PARTY_DB = require('../../../server/v1/__mocks__/mock-deal-no-party-db');
const MOCK_BSS_EWCS_DEAL_NO_COMPANIES_HOUSE = require('../../../server/v1/__mocks__/mock-deal-no-companies-house');
const MOCK_CURRENCY_EXCHANGE_RATE = require('../../../server/v1/__mocks__/mock-currency-exchange-rate');
const MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED = require('../../../server/v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE = require('../../../server/v1/__mocks__/mock-deal-AIN-submitted-non-gbp-contract-value');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../server/v1/__mocks__/mock-notify-email-response');

const MOCK_GEF_DEAL_AIN = require('../../../server/v1/__mocks__/mock-gef-deal');
const MOCK_GEF_DEAL_MIA = require('../../../server/v1/__mocks__/mock-gef-deal-MIA');
const MOCK_GEF_DEAL_MIN = require('../../../server/v1/__mocks__/mock-gef-deal-MIN');
const { MOCK_PORTAL_USERS } = require('../../../server/v1/__mocks__/mock-portal-users');
const { MOCK_FACILITIES } = require('../../../server/v1/__mocks__/mock-facilities');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(MOCK_NOTIFY_EMAIL_RESPONSE));

const updatePortalBssDealStatusSpy = jest.fn(() => Promise.resolve({}));
const updatePortalGefDealStatusSpy = jest.fn(() => Promise.resolve({}));
const findBankByIdSpy = jest.fn(() => Promise.resolve({ emails: [] }));
const findOneTeamSpy = jest.fn(() => Promise.resolve({ email: [] }));

const updateGefFacilitySpy = jest.fn(() => Promise.resolve({}));

const getGefMandatoryCriteriaByVersion = jest.fn(() => Promise.resolve([]));
api.getGefMandatoryCriteriaByVersion = getGefMandatoryCriteriaByVersion;

jest.mock('../../../server/v1/controllers/acbs.controller', () => ({
  issueAcbsFacilities: jest.fn(),
  createACBS: jest.fn(),
}));

jest.mock('../../../server/v1/integrations/apim-gift', () => ({
  canSendToApimGift: jest.fn(),
  sendFacilitiesToApimGift: jest.fn(),
}));

describe('/v1/deals', () => {
  beforeEach(() => {
    acbsController.issueAcbsFacilities.mockClear();
    canSendToApimGift.mockClear();
    canSendToApimGift.mockResolvedValue({
      canSendFacilitiesToApimGift: false,
      issuedFacilities: [],
    });

    sendFacilitiesToApimGift.mockClear();

    api.getFacilityExposurePeriod.mockClear();
    api.getPremiumSchedule.mockClear();

    sendEmailApiSpy.mockClear();
    api.sendEmail = sendEmailApiSpy;

    updatePortalBssDealStatusSpy.mockClear();
    updatePortalGefDealStatusSpy.mockClear();
    api.updatePortalBssDealStatus = updatePortalBssDealStatusSpy;
    api.updatePortalGefDealStatus = updatePortalGefDealStatusSpy;

    updateGefFacilitySpy.mockClear();
    api.updateGefFacility = updateGefFacilitySpy;

    findBankByIdSpy.mockClear();
    api.findBankById = findBankByIdSpy;

    findOneTeamSpy.mockClear();
    api.findOneTeam = findOneTeamSpy;

    api.findOneDeal.mockReset();
    mockFindOneDeal();

    api.updateDeal.mockReset();
    mockUpdateDeal();
  });

  const mockChecker = MOCK_PORTAL_USERS[0];
  const auditDetails = generatePortalAuditDetails(mockChecker._id);

  describe('PUT /v1/deals/:dealId/submit', () => {
    it(`should return ${HttpStatusCode.BadRequest} for a submission with an invalid checker id`, async () => {
      // Arrange & Act
      const { status } = await submitDeal({ checker: { _id: '12345678910' } });

      // Assert
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it(`should return ${HttpStatusCode.NotFound} for a submission with an unknown id`, async () => {
      // Arrange & Act
      const { status } = await submitDeal({ dealId: '12345678910', checker: mockChecker });

      // Assert
      expect(status).toEqual(HttpStatusCode.NotFound);
    });

    it('should add TFM deal data', async () => {
      // Arrange & Act
      const { body } = await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED));

      // Assert
      const mappedDeal = await mapSubmittedDeal(body);
      const tfmDataObject = await addTfmDealData(mappedDeal, generatePortalAuditDetails(mockChecker._id));

      // parties object is added further down the line.
      // addTfmDealData returns empty parties object.
      const tfmDataWithPartiesObject = {
        ...body.tfm,
        parties: {},
      };

      const expected = tfmDataObject.tfm;

      expect(tfmDataWithPartiesObject).toEqual(expected);
    });

    it('should return the requested resource if no companies house number is given', async () => {
      // Arrange & Act
      const { status, body } = await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_NO_COMPANIES_HOUSE));

      // Assert
      // Remove bonds & loans as they are returned mutated so will not match
      const { bondTransactions: _bondTransaction, loanTransactions: _loanTransaction, ...mockDealWithoutFacilities } = MOCK_BSS_EWCS_DEAL_NO_COMPANIES_HOUSE;

      const tfmDeal = {
        dealSnapshot: mockDealWithoutFacilities,
        tfm: {
          parties: {
            exporter: {
              partyUrn: '',
            },
          },
          tasks: createDealTasks(body, auditDetails),
        },
      };

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toMatchObject(tfmDeal);
    });

    it('should return the requested resource without partyUrn if not matched', async () => {
      // Arrange & Act
      const { status, body } = await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_NO_PARTY_DB));

      // Assert
      // Remove bonds & loans as they are returned mutated so will not match
      const { bondTransactions: _bondTransaction, loanTransactions: _loanTransaction, ...mockDealWithoutFacilities } = MOCK_BSS_EWCS_DEAL_NO_PARTY_DB;

      const tfmDeal = {
        dealSnapshot: mockDealWithoutFacilities,
        tfm: {
          parties: {
            exporter: {
              partyUrn: '',
            },
          },
          tasks: createDealTasks(body, auditDetails),
        },
      };

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toMatchObject(tfmDeal);
    });

    it('should return the requested resource with partyUrn if matched', async () => {
      // Arrange & Act
      const { status, body } = await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL));

      // Assert
      // Remove bonds & loans as they are returned mutated so will not match
      const { bondTransactions: _bondTransaction, loanTransactions: _loanTransaction, ...mockDealWithoutFacilities } = MOCK_BSS_EWCS_DEAL;

      const tfmDeal = {
        dealSnapshot: mockDealWithoutFacilities,
        tfm: {
          parties: {
            exporter: {
              partyUrn: 'testPartyUrn',
            },
          },
          tasks: createDealTasks(body, auditDetails),
        },
      };

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toMatchObject(tfmDeal);
    });

    describe(`when currency is NOT ${CURRENCY.GBP}`, () => {
      it(`should convert supplyContractValue to ${CURRENCY.GBP}`, async () => {
        // Arrange & Act
        const { status, body } = await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE));

        // Assert
        expect(status).toEqual(HttpStatusCode.Ok);

        const { supplyContractValue } = MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE.submissionDetails;

        const strippedContractValue = Number(supplyContractValue.replace(/,/g, ''));

        const expected = strippedContractValue * MOCK_CURRENCY_EXCHANGE_RATE;

        expect(body.tfm.supplyContractValueInGBP).toEqual(expected);
      });
    });

    describe(`TFM deal stage (${DEAL_TYPE.GEF})`, () => {
      describe(`when deal is ${DEAL_SUBMISSION_TYPE.AIN}`, () => {
        describe('when deal status is `Submitted`', () => {
          it('should add `Application` tfm stage', async () => {
            // Arrange & Act
            const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_AIN));

            // Assert
            expect(status).toEqual(HttpStatusCode.Ok);

            expect(body.tfm.stage).toEqual(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
          });
        });
      });

      describe(`when deal is ${DEAL_SUBMISSION_TYPE.MIA}`, () => {
        describe('when deal status is `Submitted`', () => {
          it('should add `Application` tfm stage', async () => {
            // Arrange & Act
            const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIA));

            // Assert
            expect(status).toEqual(HttpStatusCode.Ok);
            expect(body.tfm.stage).toEqual(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
          });
        });
      });

      describe(`when deal is ${DEAL_SUBMISSION_TYPE.MIN}`, () => {
        it('should add `Application` tfm stage', async () => {
          // Arrange & Act
          const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIN));

          // Assert
          expect(status).toEqual(HttpStatusCode.Ok);
          expect(body.tfm.stage).toEqual(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
        });
      });
    });

    it('should add dateReceived to deal.tfm', async () => {
      // Arrange & Act
      const { status, body } = await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED));

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);

      const expectedDateReceived = generateDateReceived().dateReceived;
      expect(body.tfm.dateReceived).toEqual(expectedDateReceived);
      expect(body.tfm.dateReceivedTimestamp).toBeDefined();
    });

    describe(`when dealType is '${DEAL_TYPE.GEF}'`, () => {
      it(`should return ${HttpStatusCode.Ok}`, async () => {
        // Arrange & Act
        const { status } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_AIN));

        // Assert
        expect(status).toEqual(HttpStatusCode.Ok);
      });

      it('should call updateGefFacility', async () => {
        // Arrange & Act
        const { body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_AIN));

        // Assert
        const facilityId = body.facilities.find((f) => f.hasBeenIssued === true)._id;

        expect(updateGefFacilitySpy).toHaveBeenCalledWith({
          auditDetails,
          facilityId,
          facilityUpdate: {
            hasBeenIssuedAndAcknowledged: true,
          },
        });
      });
    });

    describe('portal status updates', () => {
      describe(`when ${DEAL_SUBMISSION_TYPE.AIN} ${DEAL_TYPE.BSS} deal is submitted`, () => {
        it('should call externalApis.updatePortalDealStatus with correct status', async () => {
          // Arrange & Act
          await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL));

          // Assert
          expect(updatePortalBssDealStatusSpy).toHaveBeenCalledWith({
            dealId: MOCK_BSS_EWCS_DEAL._id,
            status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
            auditDetails,
          });
        });
      });

      describe(`when ${DEAL_SUBMISSION_TYPE.MIN} ${DEAL_TYPE.BSS} deal is submitted`, () => {
        it('should call externalApis.updatePortalDealStatus with correct status', async () => {
          // Arrange & Act
          await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_MIN));

          // Assert
          expect(updatePortalBssDealStatusSpy).toHaveBeenCalledWith({
            dealId: MOCK_BSS_EWCS_DEAL_MIN._id,
            status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
            auditDetails,
          });
        });
      });

      describe(`when ${DEAL_SUBMISSION_TYPE.MIA} ${DEAL_TYPE.BSS} deal is submitted`, () => {
        it('should call externalApis.updatePortalDealStatus with correct status', async () => {
          // Arrange & Act
          await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_MIA));

          // Assert
          expect(updatePortalBssDealStatusSpy).toHaveBeenCalledWith({
            dealId: MOCK_BSS_EWCS_DEAL_MIA._id,
            status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.IN_PROGRESS_BY_UKEF,
            auditDetails,
          });
        });
      });

      describe(`when ${DEAL_SUBMISSION_TYPE.AIN} ${DEAL_TYPE.GEF} deal is submitted`, () => {
        it('should call externalApis.updateGefDealStatus with correct status', async () => {
          // Arrange & Act
          await submitDeal(createSubmitBody(MOCK_GEF_DEAL_AIN));

          // Assert
          expect(updatePortalGefDealStatusSpy).toHaveBeenCalledWith({
            dealId: MOCK_GEF_DEAL_AIN._id,
            status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
            auditDetails,
          });
        });
      });

      describe(`when ${DEAL_SUBMISSION_TYPE.MIN} ${DEAL_TYPE.GEF} deal is submitted`, () => {
        it('should call externalApis.updateGefDealStatus with correct status', async () => {
          // Arrange & Act
          await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIN));

          // Assert
          expect(updatePortalGefDealStatusSpy).toHaveBeenCalledWith({
            dealId: MOCK_GEF_DEAL_MIN._id,
            status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
            auditDetails,
          });
        });
      });

      describe(`when ${DEAL_SUBMISSION_TYPE.MIA} ${DEAL_TYPE.GEF} deal is submitted`, () => {
        it('should call externalApis.updateGefDealStatus with correct status', async () => {
          // Arrange & Act
          await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIA));

          // Assert
          expect(updatePortalGefDealStatusSpy).toHaveBeenCalledWith({
            dealId: MOCK_GEF_DEAL_MIA._id,
            status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.IN_PROGRESS_BY_UKEF,
            auditDetails,
          });
        });
      });
    });

    it('should call canSendToApimGift', async () => {
      // Arrange & Act
      const { body } = await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL));

      // Assert
      expect(canSendToApimGift).toHaveBeenCalledWith(body);
    });

    it('should call sendFacilitiesToApimGift', async () => {
      // Arrange
      const mockIssuedFacilities = [...MOCK_BSS_EWCS_DEAL.bondTransactions.items, ...MOCK_BSS_EWCS_DEAL.loanTransactions.items].filter(
        (facility) => facility.hasBeenIssued,
      );

      canSendToApimGift.mockResolvedValueOnce({
        canSendFacilitiesToApimGift: true,
        issuedFacilities: mockIssuedFacilities,
      });

      // Act
      await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL));

      // Assert
      const submittedDeal = canSendToApimGift.mock.calls[0][0];

      expect(sendFacilitiesToApimGift).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          deal: submittedDeal,
          facilities: mockIssuedFacilities,
        }),
      );
    });

    describe('sendFacilitiesToApimGift only called with facilities not already in GIFT', () => {
      const mockFacility1 = {
        ...MOCK_FACILITIES[0],
        facilitySnapshot: {
          ...MOCK_FACILITIES[0].facilitySnapshot,
          ukefFacilityId: 'FACILITY_A',
        },
      };

      const mockFacility2 = {
        ...MOCK_FACILITIES[1],
        facilitySnapshot: {
          ...MOCK_FACILITIES[1].facilitySnapshot,
          ukefFacilityId: 'FACILITY_B',
        },
      };

      const mockFacility3 = {
        ...MOCK_FACILITIES[2],
        facilitySnapshot: {
          ...MOCK_FACILITIES[2].facilitySnapshot,
          _id: 'mock-facility-3',
          ukefFacilityId: 'FACILITY_C',
        },
      };

      describe('when all issued facilities are not in GIFT', () => {
        it('should call sendFacilitiesToApimGift with all issued facilities', async () => {
          // Arrange
          canSendToApimGift.mockResolvedValueOnce({
            canSendFacilitiesToApimGift: true,
            issuedFacilities: [mockFacility1, mockFacility2],
            isBssEwcsDeal: true,
            isGefDeal: false,
          });

          // Act
          await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED));

          // Assert
          const submittedDeal = canSendToApimGift.mock.calls[0][0];

          expect(sendFacilitiesToApimGift).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
              deal: submittedDeal,
              facilities: [mockFacility1, mockFacility2],
              isBssEwcsDeal: true,
              isGefDeal: false,
            }),
          );
        });
      });

      describe('when there are no issued facilities to send to GIFT', () => {
        it('should not call sendFacilitiesToApimGift', async () => {
          // Arrange
          canSendToApimGift.mockResolvedValueOnce({
            canSendFacilitiesToApimGift: false,
            issuedFacilities: [], // no facilities to send
            isBssEwcsDeal: true,
            isGefDeal: false,
          });

          // Act
          await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED));

          // Assert
          expect(sendFacilitiesToApimGift).not.toHaveBeenCalled();
        });
      });

      describe('when some issued facilities are in GIFT, some are not', () => {
        it('should call sendFacilitiesToApimGift with the issued facilities that are not in GIFT', async () => {
          // Arrange
          canSendToApimGift.mockResolvedValueOnce({
            canSendFacilitiesToApimGift: true,
            issuedFacilities: [mockFacility2, mockFacility3], // only facility 2 and 3 are not in GIFT
            isBssEwcsDeal: true,
            isGefDeal: false,
          });

          // Act
          await submitDeal(createSubmitBody(MOCK_BSS_EWCS_DEAL_AIN_SUBMITTED));

          // Assert
          const submittedDeal = canSendToApimGift.mock.calls[0][0];

          expect(sendFacilitiesToApimGift).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
              deal: submittedDeal,
              facilities: [mockFacility2, mockFacility3],
              isBssEwcsDeal: true,
              isGefDeal: false,
            }),
          );
        });
      });
    });
  });
});

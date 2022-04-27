const externalApis = require('../../../src/v1/api');
const acbsController = require('../../../src/v1/controllers/acbs.controller');
const submitDeal = require('../utils/submitDeal');
const mapSubmittedDeal = require('../../../src/v1/mappings/map-submitted-deal');
const addTfmDealData = require('../../../src/v1/controllers/deal-add-tfm-data');
const { createDealTasks } = require('../../../src/v1/controllers/deal.tasks');
const generateDateReceived = require('../../../src/v1/controllers/deal-add-tfm-data/dateReceived');

const CONSTANTS = require('../../../src/constants');

const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_MIN = require('../../../src/v1/__mocks__/mock-deal-MIN');
const MOCK_DEAL_MIA = require('../../../src/v1/__mocks__/mock-deal-MIA-not-submitted');
const MOCK_DEAL_NO_PARTY_DB = require('../../../src/v1/__mocks__/mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('../../../src/v1/__mocks__/mock-deal-no-companies-house');
const MOCK_CURRENCY_EXCHANGE_RATE = require('../../../src/v1/__mocks__/mock-currency-exchange-rate');
const MOCK_DEAL_AIN_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE = require('../../../src/v1/__mocks__/mock-deal-AIN-submitted-non-gbp-contract-value');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');

const MOCK_GEF_DEAL_AIN = require('../../../src/v1/__mocks__/mock-gef-deal');
const MOCK_GEF_DEAL_MIA = require('../../../src/v1/__mocks__/mock-gef-deal-MIA');
const MOCK_GEF_DEAL_MIN = require('../../../src/v1/__mocks__/mock-gef-deal-MIN');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

const updatePortalBssDealStatusSpy = jest.fn(() => Promise.resolve({}));
const updatePortalGefDealStatusSpy = jest.fn(() => Promise.resolve({}));
const findOneBankSpy = jest.fn(() => Promise.resolve({ emails: [] }));
const findOneTeamSpy = jest.fn(() => Promise.resolve({ email: [] }));

jest.mock('../../../src/v1/controllers/acbs.controller', () => ({
  issueAcbsFacilities: jest.fn(),
}));

jest.mock('../../../src/v1/controllers/deal.controller', () => ({
  ...jest.requireActual('../../../src/v1/controllers/deal.controller'),
  submitACBSIfAllPartiesHaveUrn: jest.fn(),
}));

jest.mock('../../../src/v1/controllers/deal.controller', () => ({
  ...jest.requireActual('../../../src/v1/controllers/deal.controller'),
  canDealBeSubmittedToACBS: jest.fn(),
}));

const createSubmitBody = (mockDeal) => ({
  dealId: mockDeal._id,
  dealType: mockDeal.dealType,
});

const updateGefFacilitySpy = jest.fn(() => Promise.resolve({}));

describe('/v1/deals', () => {
  beforeEach(() => {
    acbsController.issueAcbsFacilities.mockClear();
    externalApis.getFacilityExposurePeriod.mockClear();
    externalApis.getPremiumSchedule.mockClear();

    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;

    updatePortalBssDealStatusSpy.mockClear();
    updatePortalGefDealStatusSpy.mockClear();
    externalApis.updatePortalBssDealStatus = updatePortalBssDealStatusSpy;
    externalApis.updatePortalGefDealStatus = updatePortalGefDealStatusSpy;

    updateGefFacilitySpy.mockClear();
    externalApis.updateGefFacility = updateGefFacilitySpy;

    findOneBankSpy.mockClear();
    externalApis.findOneBank = findOneBankSpy;

    findOneTeamSpy.mockClear();
    externalApis.findOneTeam = findOneTeamSpy;
  });

  describe('PUT /v1/deals/:dealId/submit', () => {
    it('404s submission for unknown id', async () => {
      const { status } = await submitDeal({ dealId: '12345678910' });

      expect(status).toEqual(404);
    });

    it('should add TFM deal data', async () => {
      const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SUBMITTED));

      const mappedDeal = mapSubmittedDeal(body);
      const tfmDataObject = await addTfmDealData(mappedDeal);

      // parties object is added further down the line.
      // addTfmDealData returns empty parties object.
      const tfmDataWithPartiesObject = {
        ...body.tfm,
        parties: {},
      };

      const expected = tfmDataObject.tfm;

      expect(tfmDataWithPartiesObject).toEqual(expected);
    });

    it('returns the requested resource if no companies house no given', async () => {
      const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_NO_COMPANIES_HOUSE));
      // Remove bonds & loans as they are returned mutated so will not match
      const { bondTransactions, loanTransactions, ...mockDealWithoutFacilities } = MOCK_DEAL_NO_COMPANIES_HOUSE;

      const tfmDeal = {
        dealSnapshot: mockDealWithoutFacilities,
        tfm: {
          parties: {
            exporter: {
              partyUrn: '',
            },
          },
          tasks: createDealTasks(body),
        },
      };

      expect(status).toEqual(200);
      expect(body).toMatchObject(tfmDeal);
    });

    it('returns the requested resource without partyUrn if not matched', async () => {
      const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_NO_PARTY_DB));
      // Remove bonds & loans as they are returned mutated so will not match
      const { bondTransactions, loanTransactions, ...mockDealWithoutFacilities } = MOCK_DEAL_NO_PARTY_DB;

      const tfmDeal = {
        dealSnapshot: mockDealWithoutFacilities,
        tfm: {
          parties: {
            exporter: {
              partyUrn: '',
            },
          },
          tasks: createDealTasks(body),
        },
      };

      expect(status).toEqual(200);
      expect(body).toMatchObject(tfmDeal);
    });

    it('returns the requested resource with partyUrn if matched', async () => {
      const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL));

      // Remove bonds & loans as they are returned mutated so will not match
      const { bondTransactions, loanTransactions, ...mockDealWithoutFacilities } = MOCK_DEAL;

      const tfmDeal = {
        dealSnapshot: mockDealWithoutFacilities,
        tfm: {
          parties: {
            exporter: {
              partyUrn: 'testPartyUrn',
            },
          },
          tasks: createDealTasks(body),
        },
      };

      expect(status).toEqual(200);
      expect(body).toMatchObject(tfmDeal);
    });

    describe('currency NOT GBP', () => {
      it('should convert supplyContractValue to GBP', async () => {
        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE));
        expect(status).toEqual(200);

        const { supplyContractValue } = MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE.submissionDetails;

        const strippedContractValue = Number(supplyContractValue.replace(/,/g, ''));

        const expected = strippedContractValue * MOCK_CURRENCY_EXCHANGE_RATE;

        expect(body.tfm.supplyContractValueInGBP).toEqual(expected);
      });
    });

    describe('TFM deal stage (GEF)', () => {
      describe('when deal is AIN', () => {
        describe('when deal status is `Submitted`', () => {
          it('should add `Confirmed` tfm stage', async () => {
            const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_AIN));

            expect(status).toEqual(200);

            expect(body.tfm.stage).toEqual(CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED);
          });
        });
      });

      describe('when deal is MIA', () => {
        describe('when deal status is `Submitted`', () => {
          it('should add `Application` tfm stage', async () => {
            const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIA));

            expect(status).toEqual(200);
            expect(body.tfm.stage).toEqual(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
          });
        });
      });

      describe('when deal is MIN', () => {
        it('should NOT add tfm stage', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIN));
          expect(status).toEqual(200);
          expect(body.tfm.stage).toBeUndefined();
        });
      });
    });

    it('adds dateReceived to deal.tfm', async () => {
      const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SUBMITTED));

      expect(status).toEqual(200);

      const expectedDateReceived = generateDateReceived().dateReceived;
      expect(body.tfm.dateReceived).toEqual(expectedDateReceived);
      expect(body.tfm.dateReceivedTimestamp).toBeDefined();
    });

    describe('eStore', () => {
      describe('when deal is AIN', () => {
        it('adds estore object to the deal', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SUBMITTED));

          expect(status).toEqual(200);
          expect(body.tfm.estore).toBeDefined();
        });
      });
    });

    describe('when dealType is `GEF`', () => {
      it('should return 200', async () => {
        const { status } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_AIN));
        expect(status).toEqual(200);
      });

      it('should call updateGefFacility', async () => {
        const { body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_AIN));

        const facilityId = body.facilities.find((f) => f.hasBeenIssued === true)._id;

        expect(updateGefFacilitySpy).toHaveBeenCalledWith(
          facilityId,
          {
            hasBeenIssuedAndAcknowledged: true,
          },
        );
      });
    });

    describe('portal status updates', () => {
      describe('when AIN BSS deal is submitted', () => {
        it('should call externalApis.updatePortalDealStatus with correct status', async () => {
          await submitDeal(createSubmitBody(MOCK_DEAL));

          expect(updatePortalBssDealStatusSpy).toHaveBeenCalledWith(
            MOCK_DEAL._id,
            CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
          );
        });
      });

      describe('when MIN BSS deal is submitted', () => {
        it('should call externalApis.updatePortalDealStatus with correct status', async () => {
          await submitDeal(createSubmitBody(MOCK_DEAL_MIN));

          expect(updatePortalBssDealStatusSpy).toHaveBeenCalledWith(
            MOCK_DEAL_MIN._id,
            CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
          );
        });
      });

      describe('when MIA BSS deal is submitted', () => {
        it('should call externalApis.updatePortalDealStatus with correct status', async () => {
          await submitDeal(createSubmitBody(MOCK_DEAL_MIA));

          expect(updatePortalBssDealStatusSpy).toHaveBeenCalledWith(
            MOCK_DEAL_MIA._id,
            CONSTANTS.DEALS.PORTAL_DEAL_STATUS.IN_PROGRESS_BY_UKEF,
          );
        });
      });

      describe('when AIN GEF deal is submitted', () => {
        it('should call externalApis.updateGefDealStatus with correct status', async () => {
          await submitDeal(createSubmitBody(MOCK_GEF_DEAL_AIN));

          expect(updatePortalGefDealStatusSpy).toHaveBeenCalledWith(
            MOCK_GEF_DEAL_AIN._id,
            CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
          );
        });
      });

      describe('when MIN GEF deal is submitted', () => {
        it('should call externalApis.updateGefDealStatus with correct status', async () => {
          await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIN));

          expect(updatePortalGefDealStatusSpy).toHaveBeenCalledWith(
            MOCK_GEF_DEAL_MIN._id,
            CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED,
          );
        });
      });

      describe('when MIA GEF deal is submitted', () => {
        it('should call externalApis.updateGefDealStatus with correct status', async () => {
          await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIA));

          expect(updatePortalGefDealStatusSpy).toHaveBeenCalledWith(
            MOCK_GEF_DEAL_MIA._id,
            CONSTANTS.DEALS.PORTAL_DEAL_STATUS.IN_PROGRESS_BY_UKEF,
          );
        });
      });
    });
  });
});

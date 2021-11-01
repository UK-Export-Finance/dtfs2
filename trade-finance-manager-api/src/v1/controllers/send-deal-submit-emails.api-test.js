const {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
  generateBssDealAinMinConfirmationEmailVariables,
  sendMiaAcknowledgement,
} = require('./send-deal-submit-emails');
const { generateFacilityLists } = require('../helpers/notify-template-formatters');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');
const { gefFacilitiesList } = require('../emails/AIN-MIN-confirmation/gef-facilities-list');
const generateAinMinConfirmationEmailVars = require('../emails/AIN-MIN-confirmation/generate-email-variables');

const CONSTANTS = require('../../constants');
const MOCK_TEAMS = require('../__mocks__/mock-teams');
const api = require('../api');

const MOCK_NOTIFY_EMAIL_RESPONSE = require('../__mocks__/mock-notify-email-response');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

describe('send-deal-submit-emails', () => {
  let mockDeal;

  beforeEach(() => {
    api.sendEmail.mockClear();
    api.sendEmail = sendEmailApiSpy;
  });

  describe('before TFM update', () => {
    beforeEach(async () => {
      const mockDealMia = await api.findOneDeal('MOCK_MIA_NOT_SUBMITTED');

      mockDeal = {
        _id: mockDealMia._id,
        ukefDealId: mockDealMia.dealSnapshot.details.ukefDealId,
        submissionType: mockDealMia.dealSnapshot.details.submissionType,
        bankReferenceNumber: mockDealMia.dealSnapshot.details.bankSupplyContractID,
        maker: mockDealMia.dealSnapshot.details.maker,
        exporter: {
          companyName: mockDealMia.dealSnapshot.submissionDetails['supplier-name'],
        },
        facilities: [
          ...mockDealMia.dealSnapshot.bondTransactions.items,
          ...mockDealMia.dealSnapshot.loanTransactions.items,
        ],
        tfm: {
          tasks: [
            {
              groupTasks: [
                {
                  title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
                  team: {
                    id: 'BUSINESS_SUPPORT',
                  },
                },
              ],
            },
          ],
          history: {
            tasks: [],
            emails: [],
          },
        },
      };
    });

    describe('shouldSendFirstTaskEmail', () => {
      it('should return true when task title is `match or create parties`', () => {
        const mockTask = {
          title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        };

        const result = shouldSendFirstTaskEmail(mockTask);
        expect(result).toEqual(true);
      });

      it('should return false when task title is NOT `match or create parties`', () => {
        const mockTask = {
          title: 'Test',
        };

        const result = shouldSendFirstTaskEmail(mockTask);
        expect(result).toEqual(false);
      });
    });

    describe('sendFirstTaskEmail', () => {
      it('should return API response with correct emailVariables', async () => {
        const firstTask = mockDeal.tfm.tasks[0].groupTasks[0];

        const expectedEmailVariables = generateTaskEmailVariables(
          process.env.TFM_URI,
          firstTask,
          mockDeal._id,
          mockDeal.exporter.companyName,
          mockDeal.ukefDealId,
        );

        const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

        await sendFirstTaskEmail(mockDeal);

        expect(sendEmailApiSpy).toHaveBeenCalled();

        const firstSendEmailCall = sendEmailApiSpy.mock.calls[0];

        expect(firstSendEmailCall).toEqual([
          CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
          expectedTeamEmailAddress,
          { ...expectedEmailVariables },
        ]);
      });

      it('should return null when first task email should NOT be sent', async () => {
        const mockDealWithInvalidFirstTask = {
          ...mockDeal,
          tfm: {
            ...mockDeal.tfm,
            tasks: [
              {
                groupTasks: [
                  {
                    title: 'Test',
                  },
                ],
              },
            ],
          },
        };

        const result = await sendFirstTaskEmail(mockDealWithInvalidFirstTask);

        expect(result).toEqual(null);
      });
    });
  });

  describe('after TFM update', () => {
    beforeEach(async () => {
      const mockDealMia = await api.findOneDeal('MOCK_MIA_NOT_SUBMITTED');

      mockDeal = {
        _id: mockDealMia._id,
        ukefDealId: mockDealMia.dealSnapshot.details.ukefDealId,
        submissionType: mockDealMia.dealSnapshot.details.submissionType,
        bankReferenceNumber: mockDealMia.dealSnapshot.details.bankSupplyContractID,
        maker: mockDealMia.dealSnapshot.details.maker,
        exporter: {
          companyName: mockDealMia.dealSnapshot.submissionDetails['supplier-name'],
        },
        facilities: [
          ...mockDealMia.dealSnapshot.bondTransactions.items,
          ...mockDealMia.dealSnapshot.loanTransactions.items,
        ],
        tfm: mockDealMia.tfm,
      };
    });

    describe('sendDealSubmitEmails', () => {
      it('should return false when there is no deal', async () => {
        const result = await sendDealSubmitEmails();
        expect(result).toEqual(false);
      });

      describe('BSS deal', () => {
        describe('MIA with no issued facilities', () => {
          it('should return object of sent emails', async () => {
            const result = await sendDealSubmitEmails(mockDeal);

            const expected = {
              firstTaskEmail: await sendFirstTaskEmail(mockDeal),
              emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDeal),
              emailAcknowledgementAinMin: null,
            };

            expect(result).toEqual(expected);
          });
        });

        describe('MIN with issued and unissued facilities', () => {
          let mockDealIssuedAndUnissued;

          beforeAll(async () => {
            const mockDealMin = await api.findOneDeal('MOCK_DEAL_MIN');

            mockDealIssuedAndUnissued = {
              _id: mockDealMin._id,
              dealType: mockDealMin.dealSnapshot.dealType,
              ukefDealId: mockDealMin.dealSnapshot.details.ukefDealId,
              submissionType: mockDealMin.dealSnapshot.details.submissionType,
              bankReferenceNumber: mockDealMin.dealSnapshot.details.bankSupplyContractID,
              maker: mockDealMin.dealSnapshot.details.maker,
              exporter: {
                companyName: mockDealMin.dealSnapshot.submissionDetails['supplier-name'],
              },
              facilities: [
                {
                  ...mockDealMin.dealSnapshot.bondTransactions.items[0],
                  hasBeenIssued: false, // field is added during deal.submit mapping
                },
                {
                  ...mockDealMin.dealSnapshot.loanTransactions.items[0],
                  hasBeenIssued: true, // field is added during deal.submit mapping
                },
              ],
              tfm: mockDealMin.tfm,
            };
          });

          it('should call sendEmail and return object of sent emails ', async () => {
            const result = await sendDealSubmitEmails(mockDealIssuedAndUnissued);

            const facilityLists = generateFacilityLists(
              mockDealIssuedAndUnissued.dealType,
              mockDealIssuedAndUnissued.facilities,
            );

            const expectedEmailVariables = generateBssDealAinMinConfirmationEmailVariables(mockDealIssuedAndUnissued, facilityLists);

            expect(sendEmailApiSpy).toHaveBeenCalled();

            const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

            expect(lastSendEmailCall).toEqual([
              CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION,
              mockDealIssuedAndUnissued.maker.email,
              { ...expectedEmailVariables },
            ]);

            expect(result).toEqual({
              firstTaskEmail: await sendFirstTaskEmail(mockDealIssuedAndUnissued),
              emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDealIssuedAndUnissued),
              emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
            });
          });
        });

        describe('MIN with issued facilities', () => {
          let mockDealIssued;

          beforeAll(async () => {
            const mockDealMin = await api.findOneDeal('MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED');

            mockDealIssued = {
              _id: mockDealMin._id,
              dealType: mockDealMin.dealSnapshot.dealType,
              ukefDealId: mockDealMin.dealSnapshot.details.ukefDealId,
              submissionType: mockDealMin.dealSnapshot.details.submissionType,
              bankReferenceNumber: mockDealMin.dealSnapshot.details.bankSupplyContractID,
              maker: mockDealMin.dealSnapshot.details.maker,
              exporter: {
                companyName: mockDealMin.dealSnapshot.submissionDetails['supplier-name'],
              },
              facilities: [
                {
                  ...mockDealMin.dealSnapshot.bondTransactions.items[0],
                  hasBeenIssued: true, // field is added during deal.submit mapping
                },
                {
                  ...mockDealMin.dealSnapshot.loanTransactions.items[0],
                  hasBeenIssued: true, // field is added during deal.submit mapping
                },
              ],
              tfm: mockDealMin.tfm,
            };
          });

          it('should call sendEmail and return object of sent emails ', async () => {
            const result = await sendDealSubmitEmails(mockDealIssued);

            const facilityLists = generateFacilityLists(
              mockDealIssued.dealType,
              mockDealIssued.facilities,
            );

            const expectedEmailVariables = generateBssDealAinMinConfirmationEmailVariables(mockDealIssued, facilityLists);

            expect(sendEmailApiSpy).toHaveBeenCalled();

            const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

            expect(lastSendEmailCall).toEqual([
              CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION,
              mockDealIssued.maker.email,
              { ...expectedEmailVariables },
            ]);

            expect(result).toEqual({
              firstTaskEmail: await sendFirstTaskEmail(mockDealIssued),
              emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDealIssued),
              emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
            });
          });
        });

        describe('AIN with issued and unissued facilities', () => {
          let mockDealIssuedAndUnissued;

          beforeEach(async () => {
            const mockDealAin = await api.findOneDeal('AIN_DEAL_SUBMITTED');

            mockDealIssuedAndUnissued = {
              _id: mockDealAin._id,
              dealType: mockDealAin.dealSnapshot.dealType,
              ukefDealId: mockDealAin.dealSnapshot.details.ukefDealId,
              submissionType: mockDealAin.dealSnapshot.details.submissionType,
              bankReferenceNumber: mockDealAin.dealSnapshot.details.bankSupplyContractID,
              maker: mockDealAin.dealSnapshot.details.maker,
              exporter: {
                companyName: mockDealAin.dealSnapshot.submissionDetails['supplier-name'],
              },
              facilities: [
                {
                  ...mockDealAin.dealSnapshot.bondTransactions.items[0],
                  hasBeenIssued: false, // field is added during deal.submit mapping
                },
                {
                  ...mockDealAin.dealSnapshot.loanTransactions.items[0],
                  hasBeenIssued: true, // field is added during deal.submit mapping
                },
              ],
              tfm: mockDealAin.tfm,
            };
          });

          it('should call sendEmail and return object of sent emails ', async () => {
            const result = await sendDealSubmitEmails(mockDealIssuedAndUnissued);

            const facilityLists = generateFacilityLists(
              mockDealIssuedAndUnissued.dealType,
              mockDealIssuedAndUnissued.facilities,
            );

            const expectedEmailVariables = generateBssDealAinMinConfirmationEmailVariables(mockDealIssuedAndUnissued, facilityLists);

            expect(sendEmailApiSpy).toHaveBeenCalled();

            const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

            expect(lastSendEmailCall).toEqual([
              CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION,
              mockDealIssuedAndUnissued.maker.email,
              { ...expectedEmailVariables },
            ]);

            expect(result).toEqual({
              firstTaskEmail: await sendFirstTaskEmail(mockDealIssuedAndUnissued),
              emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDealIssuedAndUnissued),
              emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
            });
          });
        });

        describe('AIN with issued facilities', () => {
          let mockDealIssued;

          beforeEach(async () => {
            const mockDealAin = await api.findOneDeal('MOCK_DEAL_ISSUED_FACILITIES');

            mockDealIssued = {
              _id: mockDealAin._id,
              dealType: mockDealAin.dealSnapshot.dealType,
              ukefDealId: mockDealAin.dealSnapshot.details.ukefDealId,
              submissionType: mockDealAin.dealSnapshot.details.submissionType,
              bankReferenceNumber: mockDealAin.dealSnapshot.details.bankSupplyContractID,
              maker: mockDealAin.dealSnapshot.details.maker,
              exporter: {
                companyName: mockDealAin.dealSnapshot.submissionDetails['supplier-name'],
              },
              facilities: [
                {
                  ...mockDealAin.dealSnapshot.bondTransactions.items[0],
                  hasBeenIssued: true, // field is added during deal.submit mapping
                },
                {
                  ...mockDealAin.dealSnapshot.loanTransactions.items[0],
                  hasBeenIssued: true, // field is added during deal.submit mapping
                },
              ],
              tfm: mockDealAin.tfm,
            };
          });

          it('should call sendEmail and return object of sent emails ', async () => {
            const result = await sendDealSubmitEmails(mockDealIssued);

            const facilityLists = generateFacilityLists(
              mockDealIssued.dealType,
              mockDealIssued.facilities,
            );

            const expectedEmailVariables = generateBssDealAinMinConfirmationEmailVariables(mockDealIssued, facilityLists);

            expect(sendEmailApiSpy).toHaveBeenCalled();

            const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

            expect(lastSendEmailCall).toEqual([
              CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION,
              mockDealIssued.maker.email,
              { ...expectedEmailVariables },
            ]);

            expect(result).toEqual({
              firstTaskEmail: await sendFirstTaskEmail(mockDealIssued),
              emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDealIssued),
              emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
            });
          });
        });
      });

      describe('GEF deal - AIN', () => {
        let mockDeal;

        beforeEach(async () => {
          mockDeal = await api.findOneDeal('MOCK_GEF_DEAL');
        });

        it('should call sendEmail and return object of sent emails ', async () => {
          const mappedDeal = mapSubmittedDeal(mockDeal);

          const result = await sendDealSubmitEmails(mappedDeal);

          const facilityLists = gefFacilitiesList(mappedDeal.facilities);

          const expectedEmailVariables = generateAinMinConfirmationEmailVars(
            mappedDeal,
            facilityLists,
          );

          expect(sendEmailApiSpy).toHaveBeenCalled();

          const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

          expect(lastSendEmailCall).toEqual([
            CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_SUBMIT_CONFIRMATION,
            mappedDeal.maker.email,
            { ...expectedEmailVariables },
          ]);

          expect(result).toEqual({
            firstTaskEmail: await sendFirstTaskEmail(mappedDeal),
            emailAcknowledgementMIA: await sendMiaAcknowledgement(mappedDeal),
            emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
          });
        });
      });

      describe('GEF deal - MIN', () => {
        let mockDeal;

        beforeEach(async () => {
          mockDeal = await api.findOneDeal('MOCK_GEF_DEAL_MIN');
        });

        it('should call sendEmail and return object of sent emails ', async () => {
          const mappedDeal = mapSubmittedDeal(mockDeal);

          const result = await sendDealSubmitEmails(mappedDeal);

          const facilityLists = gefFacilitiesList(mappedDeal.facilities);

          const expectedEmailVariables = generateAinMinConfirmationEmailVars(
            mappedDeal,
            facilityLists,
          );

          expect(sendEmailApiSpy).toHaveBeenCalled();

          const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

          expect(lastSendEmailCall).toEqual([
            CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_SUBMIT_CONFIRMATION,
            mappedDeal.maker.email,
            { ...expectedEmailVariables },
          ]);

          expect(result).toEqual({
            firstTaskEmail: await sendFirstTaskEmail(mappedDeal),
            emailAcknowledgementMIA: await sendMiaAcknowledgement(mappedDeal),
            emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
          });
        });
      });
    });
  });
});

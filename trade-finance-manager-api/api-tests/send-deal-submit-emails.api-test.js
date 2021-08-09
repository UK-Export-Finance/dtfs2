const {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
  sendMiaAcknowledgement,
  generateFacilitiesListString,
} = require('../src/v1/controllers/send-deal-submit-emails');
const { generateTaskEmailVariables } = require('../src/v1/helpers/generate-task-email-variables');

const CONSTANTS = require('../src/constants');
const MOCK_TEAMS = require('../src/v1/__mocks__/mock-teams');
const api = require('../src/v1/api');

describe('send-deal-submit-emails', () => {
  let mockDeal;
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

        // api response is mocked/stubbed
        const expected = {
          content: {
            body: {},
          },
          id: CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
          email: expectedTeamEmailAddress,
          ...expectedEmailVariables,
          template: {},
        };

        const result = await sendFirstTaskEmail(mockDeal);

        expect(result).toEqual(expected);
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

    describe('send MIA acknowledgement', () => {
      it('should return API response with correct emailVariables', async () => {
        const bssList = generateFacilitiesListString(
          mockDeal.facilities.filter(
            ({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          ),
        );
        const ewcsList = generateFacilitiesListString(
          mockDeal.facilities.filter(
            ({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
          ),
        );

        const expectedEmailVariables = {
          recipientName: mockDeal.maker.firstname,
          exporterName: mockDeal.exporter.companyName,
          bankReferenceNumber: mockDeal.bankReferenceNumber,
          ukefDealId: mockDeal.ukefDealId,
          bssList,
          showBssHeader: 'yes',
          ewcsList,
          showEwcsHeader: 'yes',
        };

        const { email: expectedTeamEmailAddress } = mockDeal.maker;

        // api response is mocked/stubbed
        const expected = {
          content: {
            body: {},
          },
          id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED,
          email: expectedTeamEmailAddress,
          ...expectedEmailVariables,
          template: {},
        };

        const result = await sendMiaAcknowledgement(mockDeal);

        expect(result).toEqual(expected);
      });

      it('should not show BSS header if no bonds', async () => {
        const facilities = mockDeal.facilities.filter(
          ({ facilityType }) => facilityType !== CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
        );

        const mockDealNoBss = {
          ...mockDeal,
          facilities,
        };

        const bssList = generateFacilitiesListString(
          mockDealNoBss.facilities.filter(
            ({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          ),
        );
        const ewcsList = generateFacilitiesListString(
          mockDealNoBss.facilities.filter(
            ({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
          ),
        );

        const expectedEmailVariables = {
          recipientName: mockDeal.maker.firstname,
          exporterName: mockDeal.exporter.companyName,
          bankReferenceNumber: mockDeal.bankReferenceNumber,
          ukefDealId: mockDeal.ukefDealId,
          bssList,
          showBssHeader: 'no',
          ewcsList,
          showEwcsHeader: 'yes',
        };

        const { email: expectedTeamEmailAddress } = mockDeal.maker;

        // api response is mocked/stubbed
        const expected = {
          content: {
            body: {},
          },
          id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED,
          email: expectedTeamEmailAddress,
          ...expectedEmailVariables,
          template: {},
        };

        const result = await sendMiaAcknowledgement(mockDealNoBss);
        expect(result).toEqual(expected);
      });

      it('should not show EWCS header if no loans', async () => {
        const facilities = mockDeal.facilities.filter(
          ({ facilityType }) => facilityType !== CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
        );
        const mockDealNoEwcs = {
          ...mockDeal,
          facilities,
        };

        const bssList = generateFacilitiesListString(
          mockDealNoEwcs.facilities.filter(
            ({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          ),
        );
        const ewcsList = generateFacilitiesListString(
          mockDealNoEwcs.facilities.filter(
            ({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
          ),
        );

        const expectedEmailVariables = {
          recipientName: mockDeal.maker.firstname,
          exporterName: mockDeal.exporter.companyName,
          bankReferenceNumber: mockDeal.bankReferenceNumber,
          ukefDealId: mockDeal.ukefDealId,
          bssList,
          showBssHeader: 'yes',
          ewcsList,
          showEwcsHeader: 'no',
        };

        const { email: expectedTeamEmailAddress } = mockDeal.maker;

        // api response is mocked/stubbed
        const expected = {
          content: {
            body: {},
          },
          id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED,
          email: expectedTeamEmailAddress,
          ...expectedEmailVariables,
          template: {},
        };

        const result = await sendMiaAcknowledgement(mockDealNoEwcs);
        expect(result).toEqual(expected);
      });

      it('should generate the correct Bond string depending on uniqueIdentificationNumber', async () => {
        const facilityBankRef = {
          facilityType: 'bond',
          uniqueIdentificationNumber: 'mockBankRef',
          ukefFacilityID: 'ukefId1',
        };
        const facilityNoBankRef = {
          facilityType: 'bond',
          uniqueIdentificationNumber: '',
          ukefFacilityID: 'ukefId2',
        };

        const expected = '- Bond facility with your reference mockBankRef has been given the UKEF reference: ukefId1 \n- Bond facility has been given the UKEF reference: ukefId2 \n';

        const result = generateFacilitiesListString([facilityBankRef, facilityNoBankRef]);
        expect(result).toEqual(expected);
      });

      it('should generate the correct Loan string depending on bankReferenceNumber', async () => {
        const facilityBankRef = {
          facilityType: 'loan',
          bankReferenceNumber: 'mockBankRef',
          ukefFacilityID: 'ukefId1',
        };
        const facilityNoBankRef = {
          facilityType: 'loan',
          bankReferenceNumber: '',
          ukefFacilityID: 'ukefId2',
        };

        const expected = '- Loan facility with your reference mockBankRef has been given the UKEF reference: ukefId1 \n- Loan facility has been given the UKEF reference: ukefId2 \n';

        const result = generateFacilitiesListString([facilityBankRef, facilityNoBankRef]);
        expect(result).toEqual(expected);
      });

      describe('sendDealSubmitEmails', () => {
        it('should return false when there is no deal', async () => {
          const result = await sendDealSubmitEmails();
          expect(result).toEqual(false);
        });

        describe('MIA with no issued facilities', () => {
          it('should return sendDealSubmitEmails response', async () => {
            const result = await sendDealSubmitEmails(mockDeal);

            const expected = {
              firstTaskEmail: await sendFirstTaskEmail(mockDeal),
              emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDeal),
              emailAcknowledgementAinMinIssued: null,
            };

            expect(result).toEqual(expected);
          });
        });

        describe('MIN with unissued facilities', () => {
          let mockDealMin;

          beforeAll(async () => {
            mockDealMin = await api.findOneDeal('MOCK_DEAL_MIN');

            mockDeal = {
              _id: mockDealMin._id,
              ukefDealId: mockDealMin.dealSnapshot.details.ukefDealId,
              submissionType: mockDealMin.dealSnapshot.details.submissionType,
              bankReferenceNumber: mockDealMin.dealSnapshot.details.bankSupplyContractID,
              maker: mockDealMin.dealSnapshot.details.maker,
              exporter: {
                companyName: mockDealMin.dealSnapshot.submissionDetails['supplier-name'],
              },
              facilities: [
                ...mockDealMin.dealSnapshot.bondTransactions.items,
                ...mockDealMin.dealSnapshot.loanTransactions.items,
              ],
              tfm: {},
            };
          });

          it('should not send emailAcknowledgementAinMinIssued', async () => {
            const result = await sendDealSubmitEmails(mockDeal);
            expect(result.emailAcknowledgementAinMinIssued).toBeNull();
          });
        });

        describe('MIN with issued facilities', () => {
          let mockDealIssued;

          beforeAll(async () => {
            const mockDealMin = await api.findOneDeal('MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED');

            mockDealIssued = {
              _id: mockDealMin._id,
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

          it('should return sendDealSubmitEmails response', async () => {
            const result = await sendDealSubmitEmails(mockDealIssued);

            const expected = {
              bankReferenceNumber: 'Mock supply contract ID',
              isAin: 'no',
              isMin: 'yes',
            };

            expect(result.emailAcknowledgementAinMinIssued).toMatchObject(expected);
          });
        });


        describe('AIN with unissued facilities', () => {
          beforeEach(async () => {
            const mockDealAin = await api.findOneDeal('AIN_DEAL_SUBMITTED');

            mockDeal = {
              _id: mockDealAin._id,
              ukefDealId: mockDealAin.dealSnapshot.details.ukefDealId,
              submissionType: mockDealAin.dealSnapshot.details.submissionType,
              bankReferenceNumber: mockDealAin.dealSnapshot.details.bankSupplyContractID,
              maker: mockDealAin.dealSnapshot.details.maker,
              exporter: {
                companyName: mockDealAin.dealSnapshot.submissionDetails['supplier-name'],
              },
              facilities: [
                ...mockDealAin.dealSnapshot.bondTransactions.items,
                ...mockDealAin.dealSnapshot.loanTransactions.items,
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

          it('should not send emailAcknowledgementAinMinIssued', async () => {
            const result = await sendDealSubmitEmails(mockDeal);
            expect(result.emailAcknowledgementAinMinIssued).toBeNull();
          });
        });

        describe('AIN with issued facilities', () => {
          beforeEach(async () => {
            const mockDealAin = await api.findOneDeal('MOCK_DEAL_ISSUED_FACILITIES');

            mockDeal = {
              _id: mockDealAin._id,
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

          it('should send emailAcknowledgementAinMinIssued', async () => {
            const result = await sendDealSubmitEmails(mockDeal);

            const expected = {
              bankReferenceNumber: mockDeal.bankReferenceNumber,
              isAin: 'yes',
              isMin: 'no',
            };

            expect(result.emailAcknowledgementAinMinIssued).toMatchObject(expected);
          });
        });
      });
    });
  });
});

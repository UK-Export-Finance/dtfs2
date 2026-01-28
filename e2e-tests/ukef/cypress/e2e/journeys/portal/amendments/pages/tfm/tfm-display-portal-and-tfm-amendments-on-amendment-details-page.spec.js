// import { getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
// import { twoYears, threeYears, today, DD_MMMM_YYYY_FORMAT, oneMonth } from '@ukef/dtfs2-common/test-helpers';
// import { format } from 'date-fns';
// import { UNDERWRITER_MANAGER_DECISIONS, PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
// import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
// import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
// import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
// import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';
// import amendmentsPage from '../../../../../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';

// const { BANK1_MAKER1 } = MOCK_USERS;

// const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

// const CHANGED_FACILITY_VALUE = '20000';
// const CHANGED_FACILITY_VALUE_1 = '30000';
// const CHANGED_FACILITY_VALUE_2 = '40000';

// const submittedByString = `${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname} - ${BANK1_MAKER1.bank.name}`;

// context('Amendments - TFM - Amendments details page - TFM should display portal and TFM amendments on the amendment details page', () => {
//   let dealId;
//   let facilityId;
//   let applicationDetailsUrl;
//   let facilityUrl;
//   let ukefFacilityId;
//   let tfmDealPage;
//   let amendmentId1;
//   let amendmentId2;

//   before(() => {
//     cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
//       dealId = insertedDeal._id;
//       applicationDetailsUrl = `/gef/application-details/${dealId}`;
//       tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;

//       cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

//       cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
//         facilityId = createdFacility.details._id;
//         ukefFacilityId = createdFacility.details.ukefFacilityId;

//         facilityUrl = `${TFM_URL}/case/${dealId}/facility/${facilityId}`;

//         cy.makerLoginSubmitGefDealForReview(insertedDeal);
//         cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

//         cy.clearSessionCookies();

//         cy.loginAndSubmitPortalAmendmentRequestToUkef({
//           facilityValueExists: true,
//           changedFacilityValue: CHANGED_FACILITY_VALUE,
//           coverEndDateExists: true,
//           changedCoverEndDate: twoYears.date,
//           applicationDetailsUrl,
//           facilityId,
//           dealId,
//         }).then((amendmentId) => {
//           amendmentId1 = amendmentId;
//         });

//         cy.visit(TFM_URL);

//         cy.tfmLogin(PIM_USER_1);
//         cy.visit(tfmDealPage);

//         cy.submitTfmAmendment({ dealId, facilityId, facilityValue: CHANGED_FACILITY_VALUE_1, coverEndDate: threeYears.date });

//         cy.loginAndSubmitPortalAmendmentRequestToUkef({
//           facilityValueExists: true,
//           changedFacilityValue: CHANGED_FACILITY_VALUE_2,
//           coverEndDateExists: true,
//           changedCoverEndDate: oneMonth.date,
//           applicationDetailsUrl,
//           facilityId,
//           dealId,
//         }).then((amendmentId) => {
//           amendmentId2 = amendmentId;
//         });
//       });
//     });
//   });

//   after(() => {
//     cy.clearCookies();
//     cy.clearSessionCookies();
//   });

//   beforeEach(() => {
//     cy.clearSessionCookies();
//     cy.login(BANK1_MAKER1);
//     cy.visit(TFM_URL);

//     cy.tfmLogin(PIM_USER_1);

//     cy.visit(facilityUrl);
//     facilityPage.facilityTabAmendments().click();
//   });

//   it('should display a row for the first portal amendment', () => {
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).heading(), `Amendment ${ukefFacilityId}-001`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).submittedBy(), submittedByString);
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).requireApproval(), 'No');

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).currentCoverEndDate(), format(new Date(mockFacility.coverEndDate), DD_MMMM_YYYY_FORMAT));
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).newCoverEndDate(), twoYears.dd_MMMM_yyyy);
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).ukefDecisionCoverEndDate(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).currentFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(mockFacility.value, 2)}`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).newFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, 2)}`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).ukefDecisionFacilityValue(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);
//   });

//   it('should display effective date in the table only for the first portal amendment', () => {
//     amendmentsPage.amendmentDetails.row(3).effectiveDate().should('not.exist');
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).effectiveDateTable(), today.dd_MMMM_yyyy);
//   });

//   it('should display an eligibility criteria table and rows for the portal amendment', () => {
//     amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTable().should('exist');

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaIdColumn(amendmentId1, 1), '1');
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTextColumn(amendmentId1, 1), 'The Facility is not an Affected Facility');
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTagColumn(amendmentId1, 1), 'TRUE');

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaIdColumn(amendmentId1, 2), '2');
//     cy.assertText(
//       amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTextColumn(amendmentId1, 2),
//       'Neither the Exporter, nor its UK Parent Obligor is an Affected Person',
//     );
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTagColumn(amendmentId1, 2), 'TRUE');

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaIdColumn(amendmentId1, 3), '3');
//     cy.assertText(
//       amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTextColumn(amendmentId1, 3),
//       'The Cover Period of the Facility is within the Facility Maximum Cover Period',
//     );
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTagColumn(amendmentId1, 3), 'TRUE');

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaIdColumn(amendmentId1, 4), '4');
//     cy.assertText(
//       amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTextColumn(amendmentId1, 4),
//       'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency) of the Facility is not more than the lesser of (i) the Available Master Guarantee Limit; and the Available Obligor(s) Limit',
//     );
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTagColumn(amendmentId1, 4), 'TRUE');

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaIdColumn(amendmentId1, 5), '5');
//     cy.assertText(
//       amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTextColumn(amendmentId1, 5),
//       'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence internally to any Relevant Person for approval as part of its usual Bank Due Diligence',
//     );
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTagColumn(amendmentId1, 5), 'TRUE');

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaIdColumn(amendmentId1, 6), '6');
//     cy.assertText(
//       amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTextColumn(amendmentId1, 6),
//       'The Bank is the sole and legal beneficial owner of, and has good title to, the Facility and any Utilisation thereunder',
//     );
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTagColumn(amendmentId1, 6), 'TRUE');

//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaIdColumn(amendmentId1, 7), '7');
//     cy.assertText(
//       amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTextColumn(amendmentId1, 7),
//       "The Bank's right, title and interest in and to the Facility and any Utilisation thereunder (including any indebtedness, obligation of liability of each Obligor) is free and clear of any Security or Quasi-Security (other than Permitted Security)",
//     );
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).eligibilityCriteriaTagColumn(amendmentId1, 7), 'TRUE');
//   });

//   it('should display a row for the second TFM amendment', () => {
//     cy.assertText(amendmentsPage.amendmentDetails.row(2).heading(), `Amendment ${ukefFacilityId}-002`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(2).effectiveDate(), today.dd_MMMM_yyyy);
//     cy.assertText(amendmentsPage.amendmentDetails.row(2).requireApproval(), 'No');

//     cy.assertText(amendmentsPage.amendmentDetails.row(2).currentCoverEndDate(), twoYears.dd_MMMM_yyyy);
//     cy.assertText(amendmentsPage.amendmentDetails.row(2).newCoverEndDate(), threeYears.dd_MMMM_yyyy);
//     cy.assertText(amendmentsPage.amendmentDetails.row(2).ukefDecisionCoverEndDate(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);

//     cy.assertText(amendmentsPage.amendmentDetails.row(2).currentFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, 2)}`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(2).newFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_1, 2)}`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(2).ukefDecisionFacilityValue(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);
//   });

//   it('should not display effective date table row and should not display a submittedBy heading for the TFM amendment', () => {
//     amendmentsPage.amendmentDetails.row(2).effectiveDateTable().should('not.exist');
//     amendmentsPage.amendmentDetails.row(2).submittedBy().should('not.exist');
//   });

//   it('should not display a eligibility criteria for the TFM table', () => {
//     amendmentsPage.amendmentDetails.row(2).eligibilityCriteriaTable().should('not.exist');
//   });

//   it('should display a row for the portal amendment', () => {
//     cy.assertText(amendmentsPage.amendmentDetails.row(1).heading(), `Amendment ${ukefFacilityId}-003`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(3).submittedBy(), submittedByString);
//     cy.assertText(amendmentsPage.amendmentDetails.row(1).requireApproval(), 'No');

//     cy.assertText(amendmentsPage.amendmentDetails.row(1).currentCoverEndDate(), threeYears.dd_MMMM_yyyy);
//     cy.assertText(amendmentsPage.amendmentDetails.row(1).newCoverEndDate(), oneMonth.dd_MMMM_yyyy);
//     cy.assertText(amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);

//     cy.assertText(amendmentsPage.amendmentDetails.row(1).currentFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_1, 2)}`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(1).newFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_2, 2)}`);
//     cy.assertText(amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);
//   });

//   it('should display effective date in the table only for the last portal amendment', () => {
//     amendmentsPage.amendmentDetails.row(1).effectiveDate().should('not.exist');
//     cy.assertText(amendmentsPage.amendmentDetails.row(1).effectiveDateTable(), today.dd_MMMM_yyyy);
//   });

//   it('should display an eligibility criteria table and rows for the third portal amendment', () => {
//     cy.checkAmendmentDetailsEligibilityTable(amendmentId2, 1);
//   });

//   it('should display an eligibility criteria table and rows for the first portal amendment', () => {
//     cy.checkAmendmentDetailsEligibilityTable(amendmentId1, 3);
//   });
// });

import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import {
  anIssuedCashFacility,
  anIssuedContingentFacility,
  anUnissuedCashFacility,
  anUnissuedContingentFacility,
} from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import facilityValue from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Application details - page tests', () => {
  /**
   * @type {string}
   */
  let dealId;

  /**
   * @type {string}
   */
  let issuedCashFacilityId;

  /**
   * @type {string}
   */
  let issuedContingentFacilityId;

  /**
   * @type {string}
   */
  let unissuedCashFacilityId;

  /**
   * @type {string}
   */
  let unissuedContingentFacilityId;

  const issuedCashFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
  const issuedContingentFacility = anIssuedContingentFacility({ facilityEndDateEnabled: true });
  const unissuedCashFacility = anUnissuedCashFacility({ facilityEndDateEnabled: true });
  const unissuedContingentFacility = anUnissuedContingentFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [issuedCashFacility], BANK1_MAKER1).then((createdFacility) => {
        issuedCashFacilityId = createdFacility.details._id;
      });

      cy.createGefFacilities(dealId, [issuedContingentFacility], BANK1_MAKER1).then((createdFacility) => {
        issuedContingentFacilityId = createdFacility.details._id;
      });

      cy.createGefFacilities(dealId, [unissuedCashFacility], BANK1_MAKER1).then((createdFacility) => {
        unissuedCashFacilityId = createdFacility.details._id;
      });

      cy.createGefFacilities(dealId, [unissuedContingentFacility], BANK1_MAKER1).then((createdFacility) => {
        unissuedContingentFacilityId = createdFacility.details._id;
      });

      cy.makerLoginSubmitGefDealForReview(insertedDeal);
      cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      cy.saveSession();
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/gef/application-details/${dealId}`));
  });

  describe('make a change button', () => {
    it('should show the make a change button for issued facilities', () => {
      applicationPreview.makeAChangeButton(issuedContingentFacilityId);
      applicationPreview.makeAChangeButton(issuedCashFacilityId);
    });

    it('should not show the make a change button for unissued facilities', () => {
      applicationPreview.makeAChangeButton(unissuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedContingentFacilityId).should('not.exist');
    });

    it('should not show the make a change button for any facility after an amendment has been submitted to checker', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));
      applicationPreview.makeAChangeButton(issuedCashFacilityId).click();

      whatDoYouNeedToChange.facilityValueCheckbox().click();
      cy.clickContinueButton();
      cy.keyboardInput(facilityValue.facilityValue(), '10000');
      cy.clickContinueButton();
      eligibility.allTrueRadioButtons().click({ multiple: true });
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'effective-date' });
      cy.clickContinueButton();
      cy.clickSubmitButton();

      cy.visit(relative(`/gef/application-details/${dealId}`));

      applicationPreview.makeAChangeButton(issuedContingentFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(issuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedContingentFacilityId).should('not.exist');
    });
  });
});

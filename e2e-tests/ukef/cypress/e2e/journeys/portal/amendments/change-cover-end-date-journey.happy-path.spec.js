import { now } from '@ukef/dtfs2-common';
import relative from '../../../relativeURL';
import MOCK_USERS from '../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import coverEndDate from '../../../../../../gef/cypress/e2e/pages/amendments/cover-end-date';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Change cover end date journey - happy path', () => {
  /**
   * @type {string}
   */
  let dealId;

  /**
   * @type {string}
   */
  let facilityId;
  /**
   * @type {string}
   */
  let amendmentId;
  /**
   * @type {Date}
   */
  let coverStartDate;

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        coverStartDate = createdFacility.details.coverStartDate ? new Date(createdFacility.details.coverStartDate) : now();
        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(relative(`/gef/application-details/${dealId}`));

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.url().then((url) => {
          const urlSplit = url.split('/');

          amendmentId = urlSplit[9];
        });
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
  });

  it('should navigate through the journey correctly', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/what-do-you-need-to-change`));

    whatDoYouNeedToChange.coverEndDateCheckbox().should('not.be.checked');
    whatDoYouNeedToChange.facilityValueCheckbox().should('not.be.checked');
    whatDoYouNeedToChange.pageHeading().contains('What do you need to change?');
    whatDoYouNeedToChange.backLink();
    whatDoYouNeedToChange.warning().contains('Check your records for the most up-to-date values');

    whatDoYouNeedToChange.coverEndDateCheckbox().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));

    coverEndDate.pageHeading().contains('New cover end date');
    coverEndDate.backLink();

    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/do-you-have-a-facility-end-date`));
  });

  it('should navigate to cancel page when cancel is clicked', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));

    coverEndDate.pageHeading().contains('New cover end date');
    coverEndDate.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });

  it('should navigate through the journey correctly if cover end date is the same with cover start date', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));

    cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: coverStartDate });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/do-you-have-a-facility-end-date`));
  });
});

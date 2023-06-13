import relative from './relativeURL';
import CREDENTIALS from '../fixtures/credentials.json';
import CONSTANTS from '../fixtures/constants';
import { MOCK_USER_MAKER } from '../fixtures/mocks/mock-user-maker';
import { MOCK_APPLICATION_AIN } from '../fixtures/mocks/mock-deals';
import { MOCK_FACILITY_ONE } from '../fixtures/mocks/mock-facilities';
import applicationPreview from './pages/application-preview';

let acknowledgedDealId;
let token;

context('Amend a facility', () => {
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
      cy.apiCreateApplication(MOCK_USER_MAKER, token).then(({ body }) => {
        acknowledgedDealId = body._id;
        cy.apiUpdateApplication(acknowledgedDealId, token, MOCK_APPLICATION_AIN).then(() => {
          cy.apiCreateFacility(acknowledgedDealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
            MOCK_FACILITY_ONE._id = facility.body.details._id;
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE);
          });
          cy.apiSetApplicationStatus(acknowledgedDealId, token, CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
        });
      });
    });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.login(CREDENTIALS.MAKER);
  });

  describe('Amend a facility', () => {
    it('clicking amend facility button should start the make an amendment journey', () => {
      cy.visit(relative(`/gef/application-details/${acknowledgedDealId}`));
      applicationPreview.amendFacilityButton().should('exist');

      applicationPreview.amendFacilityButton().click();

      cy.url().should('eq', relative('/gef/amend-facility/what-do-you-need-to-change'));
    });
  });
});

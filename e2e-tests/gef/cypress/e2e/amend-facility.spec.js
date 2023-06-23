import relative from './relativeURL';
import CREDENTIALS from '../fixtures/credentials.json';
import { FACILITY_TYPE, DEAL_STATUS } from '../fixtures/constants';
import { MOCK_USER_MAKER } from '../fixtures/mocks/mock-user-maker';
import { MOCK_APPLICATION_AIN } from '../fixtures/mocks/mock-deals';
import { MOCK_FACILITY_ONE } from '../fixtures/mocks/mock-facilities';
import applicationPreview from './pages/application-preview';

let token;

let acknowledgedDealId;
let submittedDealId;
let unissuedFacilityDealId;

const addFacility = (dealId, hasBeenIssued) => {
  cy.apiCreateFacility(dealId, FACILITY_TYPE.CASH, token).then((facility) => {
    const mockFacility = MOCK_FACILITY_ONE;
    mockFacility._id = facility.body.details._id;
    mockFacility.hasBeenIssued = hasBeenIssued;
    cy.apiUpdateFacility(facility.body.details._id, token, mockFacility);
  });
};

const createApplication = (dealStatus, user, hasBeenIssued, setDealIdCallback) => {
  cy.apiCreateApplication(user, token).then(({ body }) => {
    cy.apiUpdateApplication(body._id, token, MOCK_APPLICATION_AIN).then(() => {
      addFacility(body._id, hasBeenIssued);
      cy.apiSetApplicationStatus(body._id, token, dealStatus);
      setDealIdCallback(body._id);
    });
  });
};

context('Amend a facility', () => {
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
      createApplication(DEAL_STATUS.UKEF_ACKNOWLEDGED, MOCK_USER_MAKER, true, (dealId) => { acknowledgedDealId = dealId; });
      createApplication(DEAL_STATUS.SUBMITTED_TO_UKEF, MOCK_USER_MAKER, true, (dealId) => { submittedDealId = dealId; });
      createApplication(DEAL_STATUS.UKEF_ACKNOWLEDGED, MOCK_USER_MAKER, false, (dealId) => { unissuedFacilityDealId = dealId; });
    });
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('Amend a facility', () => {
    it('clicking amend facility button should start the make an amendment journey', () => {
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${acknowledgedDealId}`));
      applicationPreview.createFacilityAmendmentButton().should('exist');

      applicationPreview.createFacilityAmendmentButton().click();

      cy.url().should('eq', relative('/gef/amend-facility/what-do-you-need-to-change'));
    });

    it('should not show amend facility button if the deal is not acknowledged', () => {
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${submittedDealId}`));

      applicationPreview.createFacilityAmendmentButton().should('not.exist');
    });

    it('should not show amend facility button if not logged in as a maker', () => {
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${acknowledgedDealId}`));

      applicationPreview.createFacilityAmendmentButton().should('not.exist');
    });

    it('should not show amend facility button if facility has not been issued', () => {
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${unissuedFacilityDealId}`));

      applicationPreview.createFacilityAmendmentButton().should('not.exist');
    });
  });
});

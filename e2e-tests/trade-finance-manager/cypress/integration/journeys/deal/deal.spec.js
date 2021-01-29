import relative from '../../relativeURL';
import pages from '../../pages';
import MOCK_DEAL from '../../../fixtures/deal';

const MOCK_MAKER_TFM = {
  username: 'MAKER-TFM',
  password: 'AbC!2345',
  firstname: 'Tamil',
  surname: 'Rahani',
  email: 'maker@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'checker@ukexportfinance.gov.uk',
    ],
  },
};

const ADMIN_LOGIN = {
  username: 'ADMIN',
  password: 'AbC!2345',
  firstname: 'Julius',
  surname: 'No',
  email: '',
  timezone: 'Europe/London',
  roles: ['maker', 'editor', 'admin'],
  bank: {
    id: '*',
  },
};

context('User can view a case deal', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    // mimic a submitted deal:
    // 1) add submitted deal TO DB
    // 2) create the deal's facilities in facilties DB collection
    // 3) update the facilities to match the submitted deal.
    cy.insertOneDeal(MOCK_DEAL, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const mockFacilities = [
          ...deal.bondTransactions.items,
          ...deal.loanTransactions.items,
        ];

        mockFacilities.forEach((facility) => {
          cy.createFacility(facility, dealId, MOCK_MAKER_TFM).then((createdFacility) => {
            const facilityId = createdFacility._id; // eslint-disable-line no-underscore-dangle
            const facilityWithDealId = {
              ...facility,
              associatedDealId: dealId,
            };

            cy.updateFacility(facilityId, facilityWithDealId, MOCK_MAKER_TFM);

            dealFacilities.push({
              ...createdFacility,
              associatedDealId: dealId,
            });
          });
        });
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('should render case deal components', () => {
    // cy.login(MOCK_USER);

    cy.visit(relative(`/case/deal/${dealId}`));

    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
    pages.caseDealPage.mgaVersion().should('exist');
  });

  it('should render correct MGA version', () => {
    pages.caseDealPage.mgaVersion().should('have.text', 'January 2020');
  });

  describe('facilities table', () => {
    it('clicking `Facility ID` link should take user to facility details page when', () => {
      // cy.login(MOCK_USER);
      cy.visit(relative(`/case/deal/${dealId}`));

      const facilityId = dealFacilities[0]._id; // eslint-disable-line no-underscore-dangle
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/facility/${facilityId}`));
    });
  });
});

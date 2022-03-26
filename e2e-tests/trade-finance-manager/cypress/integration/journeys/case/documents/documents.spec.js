import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { T1_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Documents', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  context('eStore', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to documents page
      partials.caseSubNavigation.documentsLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/documents`));
    });

    it('should display a link to eStore', () => {
      pages.documentsPage.eStoreLink().invoke('text').then((value) => {
        expect(value.trim()).equal('View in eStore');
      });
    });
  });
});

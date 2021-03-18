import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL from '../../../../fixtures/deal';
import MOCK_USERS from '../../../../fixtures/users';

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

context('User can view bond details', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/parties`));
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });


  describe('Bond issuer page', () => {
    it('should render edit page', () => {
      pages.partiesPage.bondBeneficiaryEditLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/parties/bond-beneficiary`));
      pages.partiesPage.bondBeneficiaryEditLink().should('not.exist');

      pages.bondBeneficiaryPage.urnInput().should('exist');
      pages.bondBeneficiaryPage.heading().should('have.text', 'Edit bond beneficiary details');

      pages.bondBeneficiaryPage.saveButton().should('exist');
      pages.bondBeneficiaryPage.closeLink().should('exist');

      pages.bondBeneficiaryPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/parties`));
    });

    it('should save entered details', () => {
      const partyUrn = 'test partyurn';

      pages.partiesPage.bondBeneficiaryEditLink().click();
      pages.bondBeneficiaryPage.urnInput().type(partyUrn);

      pages.bondBeneficiaryPage.saveButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/parties`));

      pages.partiesPage.bondBeneficiaryEditLink().click();

      pages.bondBeneficiaryPage.urnInput().invoke('val').then((value) => {
        expect(value.trim()).equal(partyUrn);
      });
    });
  });
});

import relative from '../../relativeURL';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import applicationPreview from '../../pages/application-preview';

let dealId;

let issuedCashFacilityId;
let issuedContingentFacilityId;
let unissuedCashFacilityId;
let unissuedContingentFacilityId;

const makeChangeButtonText = 'Make a change';

const facilitiesToCreate = [
  { isCashFacility: true, isIssued: true },
  { isCashFacility: true, isIssued: false },
  { isCashFacility: false, isIssued: true },
  { isCashFacility: false, isIssued: false },
];

context('Amendments - Make a change button - FF_PORTAL_FACILITY_AMENDMENTS_ENABLED feature flag enabled', () => {
  before(() => {
    // cy.loadData();

    cy.createFullApplication({ facilitiesToCreate }).then((ids) => {
      const { dealId: id, facilityIds } = ids;
      dealId = id;

      issuedCashFacilityId = facilityIds[0];
      unissuedCashFacilityId = facilityIds[1];
      issuedContingentFacilityId = facilityIds[2];
      unissuedContingentFacilityId = facilityIds[3];
    });
  });

  describe('when the user is a maker', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
    });

    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should display the make a change button for issued facilities', () => {
      applicationPreview.makeAChangeButton(issuedCashFacilityId).should('exist');
      cy.assertText(applicationPreview.makeAChangeButton(issuedCashFacilityId), makeChangeButtonText);

      applicationPreview.makeAChangeButton(issuedContingentFacilityId).should('exist');
      cy.assertText(applicationPreview.makeAChangeButton(issuedContingentFacilityId), makeChangeButtonText);
    });

    it('should not display the make a change button for unissued facilities ', () => {
      applicationPreview.makeAChangeButton(unissuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedContingentFacilityId).should('not.exist');
    });
  });

  describe('when the user is not a maker', () => {
    before(() => {
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should not display the make a change button', () => {
      applicationPreview.makeAChangeButton(issuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(issuedContingentFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedContingentFacilityId).should('not.exist');
    });
  });
});

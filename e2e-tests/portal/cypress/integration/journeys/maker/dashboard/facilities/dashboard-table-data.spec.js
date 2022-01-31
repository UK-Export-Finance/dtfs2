const { format } = require('date-fns');
const {
  MOCK_DEALS,
  MOCK_FACILITIES,
  MOCK_USERS,
} = require('../fixtures');
const relative = require('../../../../relativeURL');
const { dashboardFacilities } = require('../../../../pages');
const CONSTANTS = require('../../../../../fixtures/constants');

const {
  BANK1_MAKER1,
  BANK2_MAKER2,
  ADMIN,
} = MOCK_USERS;

const {
  BSS_DEAL,
  GEF_DEAL,
  BSS_DEAL_BANK_2_MAKER_2,
} = MOCK_DEALS;

const {
  CASH_FACILITY,
  BOND_FACILITY,
} = MOCK_FACILITIES;

const formatCurrencyValue = (value) =>
  parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

const hasBeenIssuedText = (hasBeenIssued) => {
  if (hasBeenIssued) {
    return 'Issued';
  }

  return 'Unissued';
};

context('View dashboard facilities as a maker', () => {
  const ALL_DEALS = [];
  let ALL_FACILITIES = [];
  let ALL_BANK1_DEALS;
  let ALL_BANK2_DEALS;
  let gefDeal;
  let gefFacility;
  let gefFacilityId;
  let bssDeal;
  let bssFacility;
  let bssFacilityId;

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.listAllUsers().then((usersInDb) => {
      const maker = usersInDb.find((user) => user.username === BANK1_MAKER1.username);
      BSS_DEAL.maker = maker;
    });

    /*
     * insert GEF deal and facility by bank 1, maker 1
     */
    cy.insertOneGefApplication(GEF_DEAL, BANK1_MAKER1)
      .then((gefDeal) => {

        cy.updateGefApplication(gefDeal._id, GEF_DEAL, BANK1_MAKER1)
          .then((updatedGefDeal) => {
            ALL_DEALS.push(gefDeal);
          });

        CASH_FACILITY.dealId = gefDeal._id;

        cy.insertOneGefFacility(CASH_FACILITY, BANK1_MAKER1)
          .then((gefFacility) => {
            const { _id } = gefFacility.details;

            cy.updateGefFacility(_id, CASH_FACILITY, BANK1_MAKER1)
              .then((updatedGefFacility) => {
                ALL_FACILITIES.push(updatedGefFacility.details);
              });
          });
      });

    /*
     * insert BSS deal and facility by bank 1, maker 1
     */
    cy.insertOneDeal(BSS_DEAL, BANK1_MAKER1).then((bssDeal) => {
      ALL_DEALS.push(bssDeal);

      cy.createFacilities(bssDeal._id, [BOND_FACILITY], BANK1_MAKER1).then((createdFacilities) => {
        ALL_FACILITIES = [
          ...ALL_FACILITIES,
          ...createdFacilities,
        ];
      });
    });

    /*
     * insert BSS deal and facility by bank 2, maker 2
     */
    cy.insertOneDeal(BSS_DEAL_BANK_2_MAKER_2, BANK2_MAKER2).then((bssDeal) => {
      ALL_DEALS.push(bssDeal);

      cy.createFacilities(bssDeal._id, [BOND_FACILITY], BANK2_MAKER2).then((createdFacilities) => {
        ALL_FACILITIES = [
          ...ALL_FACILITIES,
          ...createdFacilities,
        ];
      });
    });
  });

  beforeEach(() => {
    gefFacility = ALL_FACILITIES.find((facility) => facility.name.includes('GEF'));
    gefFacilityId = gefFacility._id;
    gefDeal = ALL_DEALS.find((deal) => deal.dealType === 'GEF');

    bssFacility = ALL_FACILITIES.find((facility) => facility.name.includes('BSS'));
    bssFacilityId = bssFacility._id;
    bssDeal = ALL_DEALS.find((deal) => deal.dealType === 'BSS/EWCS');

    ALL_BANK1_DEALS = ALL_DEALS.filter(({ bank }) => bank.id === BANK1_MAKER1.bank.id);
    ALL_BANK2_DEALS = ALL_DEALS.filter(({ bank }) => bank.id === BANK2_MAKER2.bank.id);
  });

  after(() => {
    cy.deleteGefFacilities(gefDeal._id, ADMIN);

    const bssFacilities = ALL_FACILITIES.filter((facility) => facility.name.includes('BSS'));
    bssFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, ADMIN);
    });
  });

  it('BSS and GEF deals render on the dashboard with correct values', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    const {
      nameLink,
      ukefFacilityId,
      type,
      noticeType,
      value,
      bankStage,
      issuedDate,
    } = dashboardFacilities.row;

    //---------------------------------------------------------------
    // first deal should be the most recent (with our test data - GEF)
    //---------------------------------------------------------------
    const firstRow = cy.get('table tr').eq(1);

    firstRow.find(`[data-cy="facility__name--link--${gefFacilityId}"]`).should('exist');

    nameLink(gefFacilityId).should('contain', gefFacility.name);

    ukefFacilityId(gefFacilityId).should('contain', gefFacility.ukefFacilityId);

    type(gefFacilityId).should('contain', gefFacility.type);

    noticeType(gefFacilityId).should('contain', bssDeal.submissionType);

    let expectedValue = `${gefFacility.currency.id} ${formatCurrencyValue(gefFacility.value)}`;
    value(gefFacilityId).should('contain', expectedValue);

    let expectedBankStage = hasBeenIssuedText(gefFacility.hasBeenIssued);
    bankStage(gefFacilityId).should('contain', expectedBankStage);

    let expectedDate = format(gefFacility.submittedAsIssuedDate, 'dd MMM yyyy');
    issuedDate(gefFacilityId).should('contain', expectedDate);


    //---------------------------------------------------------------
    // second facility (BSS)
    //---------------------------------------------------------------
    const secondRow = cy.get('table tr').eq(2);

    secondRow.find(`[data-cy="facility__name--link--${bssFacilityId}"]`).should('exist');

    nameLink(bssFacilityId).should('contain', bssFacility.name);

    ukefFacilityId(bssFacilityId).should('contain', bssFacility.ukefFacilityId);

    type(bssFacilityId).should('contain', bssFacility.type);

    noticeType(bssFacilityId).should('contain', bssDeal.submissionType);

    expectedValue = `${bssFacility.currency.id} ${formatCurrencyValue(bssFacility.value)}`;
    value(bssFacilityId).should('contain', expectedValue);

    expectedBankStage = hasBeenIssuedText(bssFacility.hasBeenIssued);
    bankStage(bssFacilityId).should('contain', expectedBankStage);

    expectedDate = format(bssFacility.submittedAsIssuedDate, 'dd MMM yyyy');
    issuedDate(bssFacilityId).should('contain', expectedDate);
  });

  it('facility links go to correct deal page/URL depending on facility/deal type', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    const { nameLink } = dashboardFacilities.row;

    // GEF link
    nameLink(gefFacilityId).click();
    let expectedUrl = `/gef/application-details/${gefDeal._id}`;

    cy.url().should('eq', relative(expectedUrl));

    // go back to the dashboard
    dashboardFacilities.visit();


    // BSS link
    nameLink(bssFacilityId).click();
    expectedUrl = `/contract/${bssDeal._id}`;

    cy.url().should('eq', relative(expectedUrl));
  });

  it('should not show facilities created by other banks', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    dashboardFacilities.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${ALL_BANK1_DEALS.length} items)`);
    });

    const row = cy.get('table tr');

    row.find(`[data-cy="facility__name--link--${ALL_BANK2_DEALS[0]}"]`).should('not.exist');
  });
});

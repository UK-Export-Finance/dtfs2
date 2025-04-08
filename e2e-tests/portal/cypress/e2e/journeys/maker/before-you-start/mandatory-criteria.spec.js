const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { beforeYouStart } = pages;

context('Should render BSS/EWCS mandatory criteria', () => {
  it('should render headings, introductory text, criteria and buttons', () => {
    // Start a new BSS/EWCS submission
    cy.createBSSSubmission(BANK1_MAKER1);
    cy.url().should('eq', relative('/before-you-start'));

    // Heading
    beforeYouStart.mandatoryCriteriaHeading().should('be.visible');
    cy.assertText(beforeYouStart.mandatoryCriteriaHeading(), 'Mandatory criteria');

    // Sub-heading
    beforeYouStart.mandatoryCriteriaSubHeading().should('be.visible');
    cy.assertText(beforeYouStart.mandatoryCriteriaSubHeading(), "Does this deal meet all UKEF's mandatory criteria?");

    // Introductory text
    beforeYouStart.mandatoryCriteriaIntro().should('be.visible');
    cy.assertText(
      beforeYouStart.mandatoryCriteriaIntro(),
      'To proceed with this submission, you need to be able to affirm that all the following mandatory criteria are or will be true for this deal on the date that cover starts.',
    );

    // Mandatory criteria

    // Sub-headings
    cy.assertText(beforeYouStart.mandatoryCriterionOneTitle(), 'Supply contract/Transaction');
    cy.assertText(beforeYouStart.mandatoryCriterionTwoTitle(), 'Financial');
    cy.assertText(beforeYouStart.mandatoryCriterionThreeTitle(), 'Credit');
    cy.assertText(beforeYouStart.mandatoryCriterionFourTitle(), 'Bank Facility Letter');
    cy.assertText(beforeYouStart.mandatoryCriterionFiveTitle(), 'Legal');

    // Criteria
    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="1"]')
      .should(
        'contain',
        'The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate.',
      );

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="2"]')
      .should('contain', 'The Bank has complied with its policies and procedures in relation to the Transaction.');

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="3"]')
      .should(
        'contain',
        'Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)',
      );

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="4"]')
      .should('contain', 'Where the supplier is not a “Person Within Scope of Windsor Framework”, it is an eligible person OR');

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="5"]')
      .should('contain', 'Where the supplier is a “Person Within Scope of Windsor Framework”, both it and its parent obligor (if any) is an eligible person.');

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="6"]')
      .should(
        'contain',
        'The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one-year probability of default of less than 14.1%.',
      );

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="7"]')
      .should('contain', 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.');

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="8"]')
      .should('contain', 'The Bank is the sole and beneficial owner of, and has legal title to, the Transaction.');

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="9"]')
      .should(
        'contain',
        'The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction.',
      );

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="10"]')
      .should(
        'contain',
        'The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person.',
      );

    beforeYouStart
      .mandatoryCriterion()
      .find('li[value="11"]')
      .should(
        'contain',
        'The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction.',
      );

    // Radio buttons
    beforeYouStart.true().should('exist');
    beforeYouStart.false().should('exist');

    // Primary button
    beforeYouStart.submit().should('exist');
  });
});

import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { UNDERWRITER_MANAGER_1, UNDERWRITER_MANAGER_2, UNDERWRITER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Assign lead underwriter (MIA only)', () => {
  let dealId;
  let underwriterManager1UserId;
  let underwriterManager2UserId;
  let underwriterUserId;
  const dealFacilities = [];

  const underwriterManager1FullName = `${UNDERWRITER_MANAGER_1.firstName} ${UNDERWRITER_MANAGER_1.lastName}`;
  const underwriterManager2FullName = `${UNDERWRITER_MANAGER_2.firstName} ${UNDERWRITER_MANAGER_2.lastName}`;
  const underwriterFullName = `${UNDERWRITER_1.firstName} ${UNDERWRITER_1.lastName}`;

  before(() => {
    cy.getUser(UNDERWRITER_MANAGER_1.username).then((userObj) => {
      underwriterManager1UserId = userObj._id;
    });

    cy.getUser(UNDERWRITER_MANAGER_2.username).then((userObj) => {
      underwriterManager2UserId = userObj._id;
    });

    cy.getUser(UNDERWRITER_1.username).then((userObj) => {
      underwriterUserId = userObj._id;
    });

    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
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

  it('should show unassigned on lead underwriter section on underwriting page', () => {
    cy.login(UNDERWRITER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.showAllButton().click();

    pages.underwritingPage.leadUnderwriterUnassigned().contains('Unassigned');
    pages.underwritingPage.assignLeadUnderwriterButton().should('not.exist');
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS or UNDERWRITERS team cannot manually navigate to assign-lead-underwriter page', () => {
    cy.login(UNDERWRITER_1);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));
    cy.url().should('eq', relative('/not-found'));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS or UNDERWRITERS team should NOT see `Assign lead underwriter` link', () => {
    cy.login(UNDERWRITER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    pages.leadUnderwriterPage.assignLeadUnderwriterLink().should('not.exist');
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('not.exist');
  });

  it('underwriter manager can assign an underwriter as the lead underwriter. Submitted lead underwriter details are displayed after submit', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.assignLeadUnderwriterButton().should('exist');
    pages.underwritingPage.changeLeadUnderwriterLink().should('not.exist');

    // go to lead underwriter assign page/form
    pages.underwritingPage.assignLeadUnderwriterButton().click({ force: true });
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    // make sure select input is 'assign to me' by default
    const assignToMeSelectOptionText = `${underwriterManager1FullName} (Assign to me)`;
    pages.leadUnderwriterPage.assignedToSelectInputSelectedOption().should('have.text', assignToMeSelectOptionText);

    // assign a different underwriter
    pages.taskPage.assignedToSelectInput().select(underwriterUserId);

    pages.leadUnderwriterPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    // lead underwriter details should now be displayed
    pages.leadUnderwriterPage.leadUnderwriterEmail().invoke('text').then((text) => {
      expect(text.trim()).equal(UNDERWRITER_1.email);
    });

    pages.leadUnderwriterPage.leadUnderwriterName().invoke('text').then((text) => {
      expect(text.trim()).equal(`${underwriterFullName}`);
    });

    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('exist');
  });

  it('underwriter manager can assign an underwriter manager as the lead underwriter', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    // go to lead underwriter assign page/form
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('exist');
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().click({ force: true });
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    // assign a different underwriter manager
    pages.taskPage.assignedToSelectInput().select(underwriterManager2UserId);

    pages.leadUnderwriterPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
  });

  it('underwriter manager can assign to themselves/someone else after already submitting', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    // go to lead underwriter assign page/form
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('exist');
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().click({ force: true });

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    // make sure select input has previous lead underwriter selected
    const assignToMeSelectOptionText = `${underwriterManager2FullName}`;
    pages.leadUnderwriterPage.assignedToSelectInputSelectedOption().should('have.text', assignToMeSelectOptionText);

    // assign to yourself
    pages.taskPage.assignedToSelectInput().select(underwriterManager1UserId);

    pages.leadUnderwriterPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('exist');
  });

  it('clicking cancel link in `assign` form takes user back to lead underwriter page', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    pages.leadUnderwriterPage.cancelLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
  });

  it('assigns all MIA tasks in group 2 and 3 to the lead underwriter', () => {
    cy.login(UNDERWRITER_1);

    cy.visit(relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    const expectedTasks = [
      { groupId: 2, taskId: 1 },
      { groupId: 3, taskId: 1 },
      { groupId: 3, taskId: 2 },
      { groupId: 3, taskId: 3 },
    ];

    cy.wrap(expectedTasks).each((row) => {
      const { groupId, taskId } = row;

      pages.tasksPage.tasks.row(groupId, taskId).assignedTo().invoke('text').then((text) => {
        expect(text.trim()).to.equal(`${underwriterManager1FullName}`);
      });
    });
  });
});

import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Assign lead underwriter (MIA only)', () => {
  let deal;
  let dealId;
  let underwriterManager1UserId;
  let underwriterManager2UserId;
  const dealFacilities = [];

  const underwriter = MOCK_USERS.find((user) =>
    user.teams.includes('UNDERWRITERS'));

  const underwriterManager1 = MOCK_USERS.find((user) =>
    user.username === 'UNDERWRITER_MANAGER_1');

  const underwriterManager2 = MOCK_USERS.find((user) =>
    user.username === 'UNDERWRITER_MANAGER_2');

  const underwriterManager1FullName = `${underwriterManager1.firstName} ${underwriterManager1.lastName}`;
  const underwriterManager2FullName = `${underwriterManager2.firstName} ${underwriterManager2.lastName}`;


  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.getUser(underwriterManager1.username).then((userObj) => {
      underwriterManager1UserId = userObj._id;
    });

    cy.getUser(underwriterManager2.username).then((userObj) => {
      underwriterManager2UserId = userObj._id;
    });

    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_MIA;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('clicking `lead underwriter` nav link should direct to lead underwriter page', () => {
    cy.login(underwriter);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.leadUnderwriterLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS team cannot manually navigate to assign-lead-underwriter page', () => {
    cy.login(underwriter);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));
    cy.url().should('eq', relative('/not-found'));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS team should NOT see `Assign lead underwriter` link', () => {
    cy.login(underwriter);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.leadUnderwriterLink().click();

    pages.leadUnderwriterPage.assignLeadUnderwriterLink().should('not.be.visible');
  });

  it('underwriter manager can assign a lead underwriter. Submitted underwriter details are displayed after submit', () => {
    cy.login(underwriterManager1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.leadUnderwriterLink().click();

    pages.leadUnderwriterPage.assignLeadUnderwriterLink().should('be.visible');

    // go to lead underwriter assign page/form
    pages.leadUnderwriterPage.assignLeadUnderwriterLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    // make sure select input is 'assign to me' by default
    const assignToMeSelectOptionText = `${underwriterManager1FullName} (Assign to me)`;
    pages.leadUnderwriterPage.assignedToSelectInputSelectedOption().should('have.text', assignToMeSelectOptionText);

    // assign a different underwriter manager
    pages.taskPage.assignedToSelectInput().select(underwriterManager2UserId);

    pages.leadUnderwriterPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));

    // underwriter details should now be displayed
    pages.leadUnderwriterPage.leadUnderwriterEmail().invoke('text').then((text) => {
      expect(text.trim()).equal(underwriterManager2.email);
    });

    pages.leadUnderwriterPage.leadUnderwriterName().invoke('text').then((text) => {
      expect(text.trim()).equal(`${underwriterManager2FullName}`);
    });

    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('be.visible');
  });

  it('underwriter manager can assign to themsleves/someone else after already submitting', () => {
    cy.login(underwriterManager1);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter`));

    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('be.visible');
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    // make sure select input has previous lead undewriter selected
    const assignToMeSelectOptionText = `${underwriterManager2FullName}`;
    pages.leadUnderwriterPage.assignedToSelectInputSelectedOption().should('have.text', assignToMeSelectOptionText);

    // assign to yourself
    pages.taskPage.assignedToSelectInput().select(underwriterManager1UserId);

    pages.leadUnderwriterPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));

    // underwriter details should now be displayed
    pages.leadUnderwriterPage.leadUnderwriterEmail().invoke('text').then((text) => {
      expect(text.trim()).equal(underwriterManager1.email);
    });

    pages.leadUnderwriterPage.leadUnderwriterName().invoke('text').then((text) => {
      expect(text.trim()).equal(`${underwriterManager1FullName}`);
    });

    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('be.visible');
  });

  it('clicking cancel link in `assign` form takes user back to lead underwriter page', () => {
    cy.login(underwriterManager1);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    pages.leadUnderwriterPage.cancelLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));
  });

  it('all tasks in the UNDERWRITERS and UNDERWRITER_MANAGERS teams should be assigned to the lead underwriter', () => {
    cy.login(underwriter);

    cy.visit(relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    // const taskGroup1Task5 = pages.tasksPage.tasks.row(1, 5);

    // taskGroup1Task5.assignedTo().invoke('text').then((text) => {
    //   expect(text.trim()).to.equal(`${underwriterManager1FullName}`);
    // });

    // const taskGroup2Task1 = pages.tasksPage.tasks.row(2, 1);

    // const taskGroup3Task1 = pages.tasksPage.tasks.row(3, 1);
    // const taskGroup3Task2 = pages.tasksPage.tasks.row(3, 2);
    // const taskGroup3Task3 = pages.tasksPage.tasks.row(3, 3);

    // const taskGroup4Task1 = pages.tasksPage.tasks.row(4, 1);
    // const taskGroup4Task4 = pages.tasksPage.tasks.row(4, 3);

    const expectedTasks = [
      { groupId: 1, taskId: 5 },
      { groupId: 2, taskId: 1 },
      { groupId: 3, taskId: 1 },
      { groupId: 3, taskId: 2 },
      { groupId: 3, taskId: 3 },
      { groupId: 4, taskId: 1 },
      { groupId: 4, taskId: 3 },
    ];

    cy.wrap(expectedTasks).each((row) => {
      // const taskId = index + 1;
      // return new Cypress.Promise((resolve) => {
      //   submitTaskCompleteAndAssertOtherTasks(1, taskId);
      //   resolve();
      // });
      const { groupId, taskId } = row;

      pages.tasksPage.tasks.row(groupId, taskId).assignedTo().invoke('text').then((text) => {
        expect(text.trim()).to.equal(`${underwriterManager1FullName}`);
      });
    });
  });
});

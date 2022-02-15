import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Assign lead underwriter (MIA only)', () => {
  let dealId;
  let underwriterManager1UserId;
  let underwriterManager2UserId;
  let underwriterUserId;
  const dealFacilities = [];

  const underwriterManager1 = MOCK_USERS.find((user) =>
    user.username === 'UNDERWRITER_MANAGER_1');

  const underwriterManager2 = MOCK_USERS.find((user) =>
    user.username === 'UNDERWRITER_MANAGER_2');

  const underwriter = MOCK_USERS.find((user) =>
    user.teams.includes('UNDERWRITERS'));

  const underwriterManager1FullName = `${underwriterManager1.firstName} ${underwriterManager1.lastName}`;
  const underwriterManager2FullName = `${underwriterManager2.firstName} ${underwriterManager2.lastName}`;
  const underwriterFullName = `${underwriter.firstName} ${underwriter.lastName}`;

  before(() => {
    cy.getUser(underwriterManager1.username).then((userObj) => {
      underwriterManager1UserId = userObj._id;
    });

    cy.getUser(underwriterManager2.username).then((userObj) => {
      underwriterManager2UserId = userObj._id;
    });

    cy.getUser(underwriter.username).then((userObj) => {
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

  it('clicking `lead underwriter` nav link should direct to lead underwriter page', () => {
    cy.login(underwriter);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.leadUnderwriterLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS or UNDERWRITERS team cannot manually navigate to assign-lead-underwriter page', () => {
    cy.login(underwriter);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));
    cy.url().should('eq', relative('/not-found'));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS or UNDERWRITERS team should NOT see `Assign lead underwriter` link', () => {
    cy.login(underwriter);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter`));
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));

    pages.leadUnderwriterPage.assignLeadUnderwriterLink().should('not.exist');
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('not.exist');
  });

  it('underwriter manager can assign an underwriter as the lead underwriter. Submitted lead underwriter details are displayed after submit', () => {
    cy.login(underwriterManager1);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter`));

    pages.leadUnderwriterPage.assignLeadUnderwriterLink().should('be.visible');
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('not.exist');

    // go to lead underwriter assign page/form
    pages.leadUnderwriterPage.assignLeadUnderwriterLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    // make sure select input is 'assign to me' by default
    const assignToMeSelectOptionText = `${underwriterManager1FullName} (Assign to me)`;
    pages.leadUnderwriterPage.assignedToSelectInputSelectedOption().should('have.text', assignToMeSelectOptionText);

    // assign a different underwriter
    pages.taskPage.assignedToSelectInput().select(underwriterUserId);

    pages.leadUnderwriterPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));

    // lead underwriter details should now be displayed
    pages.leadUnderwriterPage.leadUnderwriterEmail().invoke('text').then((text) => {
      expect(text.trim()).equal(underwriter.email);
    });

    pages.leadUnderwriterPage.leadUnderwriterName().invoke('text').then((text) => {
      expect(text.trim()).equal(`${underwriterFullName}`);
    });

    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('be.visible');
  });

  it('underwriter manager can assign an underwriter manager as the lead underwriter', () => {
    cy.login(underwriterManager1);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter`));

    // go to lead underwriter assign page/form
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('be.visible');
    pages.leadUnderwriterPage.changeLeadUnderwriterLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    // assign a different underwriter manager
    pages.taskPage.assignedToSelectInput().select(underwriterManager2UserId);

    pages.leadUnderwriterPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));
  });

  it('underwriter manager can assign to themsleves/someone else after already submitting', () => {
    cy.login(underwriterManager1);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter`));

    // go to lead underwriter assign page/form
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

    pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('be.visible');
  });

  it('clicking cancel link in `assign` form takes user back to lead underwriter page', () => {
    cy.login(underwriterManager1);
    cy.visit(relative(`/case/${dealId}/underwriting/lead-underwriter/assign`));

    pages.leadUnderwriterPage.cancelLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/lead-underwriter`));
  });

  it('assigns all MIA tasks in group 2 and 3 to the lead underwriter', () => {
    cy.login(underwriter);

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

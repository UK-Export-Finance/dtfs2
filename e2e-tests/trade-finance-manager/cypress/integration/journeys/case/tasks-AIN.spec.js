import relative from '../../relativeURL';
import partials from '../../partials';
import pages from '../../pages';
import MOCK_DEAL from '../../../fixtures/deal';
import MOCK_USERS from '../../../fixtures/users';

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

context('Case tasks - AIN deal', () => {
  let deal;
  let dealId;
  const dealFacilities = [];
  const businessSupportUser = MOCK_USERS.find((u) => u.teams.includes('BUSINESS_SUPPORT'));
  const userFullName = `${businessSupportUser.firstName} ${businessSupportUser.lastName}`;
  let userId;
  let loggedInUserTeamName;
  let usersInTeam;

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

    cy.getUser(businessSupportUser.username).then((userObj) => {
      userId = userObj._id;
    });

    loggedInUserTeamName = businessSupportUser.teams[0]; // eslint-disable-line
    usersInTeam = MOCK_USERS.filter((u) => u.teams.includes(loggedInUserTeamName));
  });

  beforeEach(() => {
    cy.login(businessSupportUser);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('clicking tasks nav link should direct to tasks page and render 2 tasks', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.tasksTableRows().should('have.length', 2);
  });


  it('user can assign a task to themself, change status and unassign', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    //---------------------------------------------------------------
    // user assigns task to themself
    //---------------------------------------------------------------
    const firstTask = pages.tasksPage.tasks.row('1');
    firstTask.link().click();

    cy.url().should('eq', relative(`/case/${dealId}/tasks/1`));

    // `assign to` should have total amount of users in the team and unassigned users
    const TOTAL_USERS_IN_TEAM = usersInTeam.length;
    const expected = TOTAL_USERS_IN_TEAM + 1;

    pages.taskPage.assignedToSelectInputOption().should('have.length', expected);

    // task should be unassigned by default
    pages.taskPage.assignedToSelectInput().invoke('val').should('eq', 'Unassigned');

    // select the `assign to me` option
    pages.taskPage.assignedToSelectInput().select(userId);

    // `assign to me` option should have the correct text
    const assignToMeSelectOptionText = `${userFullName} (Assign to me)`;
    pages.taskPage.assignedToSelectInputSelectedOption().should('have.text', assignToMeSelectOptionText);

    // task status should have 3 options, `to do` selected by default
    pages.taskPage.taskStatusRadioInput().should('have.length', 3);
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');

    // change task status
    pages.taskPage.taskStatusRadioInputInProgress().click();

    // submit form
    pages.taskPage.submitButton().click();

    // should now be back on the tasks page
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    // go back into the same task
    firstTask.link().click();

    // `assigned to` should be updated, only displaying the full name
    pages.taskPage.assignedToSelectInput().invoke('val').should('eq', userId);
    pages.taskPage.assignedToSelectInputSelectedOption().should('have.text', userFullName);

    // `in progess` status should be selected
    pages.taskPage.taskStatusRadioInputInProgress().should('be.checked');

    //---------------------------------------------------------------
    // user can unassign the task
    //---------------------------------------------------------------
    pages.taskPage.assignedToSelectInput().select('Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().click();
    pages.taskPage.submitButton().click();

    // should now be back on the tasks page
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    // go back into the same task, check values
    firstTask.link().click();
    pages.taskPage.assignedToSelectInput().find('option:selected').should('have.text', 'Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');
  });

  it('user can assign a task to someone else', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    let firstTask = pages.tasksPage.tasks.row('1');
    firstTask.link().click();

    const differentUserInSameTeam = usersInTeam.find((u) => u.username !== businessSupportUser.username);
    let differentUserInSameTeamObj;

    // select option values are userIds.
    // we need to use userId to select the option value in e2e test
    // selecting 1st/2nd/3rd option can be flaky.
    cy.getUser(differentUserInSameTeam.username).then((userObj) => {
      differentUserInSameTeamObj = userObj;
      const { firstName, lastName } = differentUserInSameTeamObj;

      // choose a user in `assigned to` select input, that is not the currently logged in
      // eslint-disable-next-line no-underscore-dangle
      pages.taskPage.assignedToSelectInput().select(differentUserInSameTeamObj._id);
      pages.taskPage.taskStatusRadioInputInProgress().click();

      // submit form
      pages.taskPage.submitButton().click();

      // should now be back on the tasks page
      cy.url().should('eq', relative(`/case/${dealId}/tasks`));

      // go back into the same task, check values
      firstTask = pages.tasksPage.tasks.row('1');
      firstTask.link().click();

      const differentUserInSameTeamFullName = `${firstName} ${lastName}`;
      pages.taskPage.assignedToSelectInput().find('option:selected').should('have.text', differentUserInSameTeamFullName);
      pages.taskPage.taskStatusRadioInputInProgress().should('be.checked');

      // check that the updated task displays correct assignee and status in home page
      pages.taskPage.closeLink().click();

      firstTask.assignedTo().invoke('text').then((text) => {
        expect(text.trim()).to.equal(differentUserInSameTeamFullName);
      });

      firstTask.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal('In progress');
      });
    });
  });

  it('when user changes task form and clicks `close without saving`, form should be unchanged', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    const firstTask = pages.tasksPage.tasks.row('1');
    firstTask.link().click();

    // make sure the task is unassigned to start with
    pages.taskPage.assignedToSelectInput().select('Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().click();
    pages.taskPage.submitButton().click();

    firstTask.link().click();

    // check default values
    pages.taskPage.assignedToSelectInput().invoke('val').should('eq', 'Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');

    // change `assigned to` and status
    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputInProgress().click();

    pages.taskPage.closeLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    // check form values are the default values
    firstTask.link().click();
    pages.taskPage.assignedToSelectInput().invoke('val').should('eq', 'Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');
  });
});

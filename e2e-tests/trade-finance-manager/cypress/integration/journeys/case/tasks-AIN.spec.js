import relative from '../../relativeURL';
import partials from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
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

const TOTAL_DEFAULT_AIN_TASKS = 2;

const assignTaskToSomeoneElseInMyTeam = (dealId, differentUserInSameTeam) => new Promise((resolve) => {
  cy.getUser(differentUserInSameTeam.username).then((userObj) => {
    const differentUserInSameTeamObj = userObj;

    // choose a user in `assigned to` select input, that is not the currently logged in
    // eslint-disable-next-line no-underscore-dangle
    pages.taskPage.assignedToSelectInput().select(differentUserInSameTeamObj._id);
    pages.taskPage.taskStatusRadioInputInProgress().click();

    // submit form
    pages.taskPage.submitButton().click();

    // should now be back on the tasks page
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    return resolve(differentUserInSameTeamObj);
  });
});

context('Case tasks - AIN deal', () => {
  let deal;
  let dealId;
  const dealFacilities = [];
  const businessSupportUser = MOCK_USERS.find((u) => u.teams.includes('BUSINESS_SUPPORT'));
  const nonBusinessSupportUser = MOCK_USERS.find((u) => !u.teams.includes('BUSINESS_SUPPORT'));
  const userFullName = `${businessSupportUser.firstName} ${businessSupportUser.lastName}`;
  let userId;
  let loggedInUserTeamName;
  let usersInTeam;

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_AIN;

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

  it('clicking tasks nav link should direct to tasks page and tasks assigned to user', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    // user has 0 tasks assigned by default
    pages.tasksPage.tasksTableRows().should('have.length', 0);
  });


  it('user can assign a task to themself, change status and then unassign', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    //---------------------------------------------------------------
    // user assigns task to themself
    //---------------------------------------------------------------
    pages.tasksPage.filterRadioYourTeam().click();
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
    pages.tasksPage.filterRadioYourTeam().click();
    firstTask.link().click();
    pages.taskPage.assignedToSelectInput().find('option:selected').should('have.text', 'Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');
  });

  it('user can assign a task to someone else', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioYourTeam().click();
    let firstTask = pages.tasksPage.tasks.row('1');
    firstTask.link().click();

    const differentUserInSameTeam = usersInTeam.find((u) => u.username !== businessSupportUser.username);

    assignTaskToSomeoneElseInMyTeam(dealId, differentUserInSameTeam).then((userObj) => {
      const { firstName, lastName } = userObj;

      pages.tasksPage.filterRadioYourTeam().click();

      //---------------------------------------------------------------
      // updated task displays correct assignee and status in the task page
      //---------------------------------------------------------------
      firstTask = pages.tasksPage.tasks.row('1');
      firstTask.link().click();

      const differentUserInSameTeamFullName = `${firstName} ${lastName}`;
      pages.taskPage.assignedToSelectInput().find('option:selected').should('have.text', differentUserInSameTeamFullName);
      pages.taskPage.taskStatusRadioInputInProgress().should('be.checked');

      //---------------------------------------------------------------
      // updated task displays correct assignee and status in 'tasks' page
      //---------------------------------------------------------------
      pages.taskPage.closeLink().click();

      partials.caseSubNavigation.tasksLink().click();
      pages.tasksPage.filterRadioYourTeam().click();

      firstTask.assignedTo().invoke('text').then((text) => {
        expect(text.trim()).to.equal(differentUserInSameTeamFullName);
      });

      firstTask.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal('In progress');
      });
    });
  });

  it('when user changes task form and clicks `close without saving`, task should be unchanged', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioYourTeam().click();

    const firstTask = pages.tasksPage.tasks.row('1');
    firstTask.link().click();

    // make sure the task is unassigned to start with
    pages.taskPage.assignedToSelectInput().select('Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().click();
    pages.taskPage.submitButton().click();

    pages.tasksPage.filterRadioYourTeam().click();
    firstTask.link().click();

    // check default values
    pages.taskPage.assignedToSelectInput().invoke('val').should('eq', 'Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');

    //---------------------------------------------------------------
    // change task assignee and status, click 'close without saving'
    //---------------------------------------------------------------
    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputInProgress().click();

    pages.taskPage.closeLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/tasks`));


    //---------------------------------------------------------------
    // task form values should have the default values
    //---------------------------------------------------------------
    pages.tasksPage.filterRadioYourTeam().click();
    firstTask.link().click();
    pages.taskPage.assignedToSelectInput().invoke('val').should('eq', 'Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');
  });

  describe('filters', () => {
    it('default filter should be tasks `assigned to me`', () => {
      partials.caseSubNavigation.tasksLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/tasks`));

      pages.tasksPage.filterRadioYourTasks().should('be.checked');

      //---------------------------------------------------------------
      // list of tasks in `assigned to me` shuold be empty
      // as no tasks are assigned yet (default)
      //---------------------------------------------------------------
      pages.tasksPage.tasksTableRows().should('have.length', 0);
    });

    it('user can filter all tasks `assigned to my team`', () => {
      partials.caseSubNavigation.tasksLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/tasks`));

      pages.tasksPage.filterRadioYourTeam().click();

      // all default AIN tasks are assigned to the users team
      pages.tasksPage.tasksTableRows().should('have.length', TOTAL_DEFAULT_AIN_TASKS);

      //---------------------------------------------------------------
      // assign a task to someone else on my team
      //---------------------------------------------------------------
      const firstTask = pages.tasksPage.tasks.row('1');
      firstTask.link().click();

      const differentUserInSameTeam = usersInTeam.find((u) => u.username !== businessSupportUser.username);

      assignTaskToSomeoneElseInMyTeam(dealId, differentUserInSameTeam).then(() => {
        pages.tasksPage.filterRadioYourTeam().click();

        //---------------------------------------------------------------
        // team tasks length should remain the same
        //---------------------------------------------------------------
        pages.tasksPage.tasksTableRows().should('have.length', TOTAL_DEFAULT_AIN_TASKS);
      });
    });

    it('a user in a team that does not have any assigned tasks should not see any task assigned to their team', () => {
      cy.login(nonBusinessSupportUser);
      cy.visit(relative(`/case/${dealId}/deal`));

      partials.caseSubNavigation.tasksLink().click();
      pages.tasksPage.filterRadioYourTeam().click();

      pages.tasksPage.tasksTableRows().should('have.length', 0);
    });

    it('user can view all tasks', () => {
      partials.caseSubNavigation.tasksLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/tasks`));

      pages.tasksPage.filterRadioAllTasks().click();
      pages.tasksPage.tasksTableRows().should('have.length', TOTAL_DEFAULT_AIN_TASKS);
    });
  });
});

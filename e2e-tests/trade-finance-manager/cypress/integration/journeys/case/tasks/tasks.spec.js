import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
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
  let userId;
  let loggedInUserTeamName;
  let usersInTeam;

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.getUser(businessSupportUser.username).then((userObj) => {
      userId = userObj._id;
    });

    loggedInUserTeamName = businessSupportUser.teams[0]; // eslint-disable-line
    usersInTeam = MOCK_USERS.filter((u) => u.teams.includes(loggedInUserTeamName));
  });

  beforeEach(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);

        cy.login(businessSupportUser);
        cy.visit(relative(`/case/${dealId}/deal`));
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('clicking tasks nav link should direct to tasks page showing tasks assigned to user', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    // user has 0 tasks assigned by default
    pages.tasksPage.tasksTableRows().should('have.length', 0);
  });

  it('user cannot navigate/start task #2 if task #1 is not started', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioYourTeam().click();

    //---------------------------------------------------------------
    // first task should have status `To do` and link
    //---------------------------------------------------------------
    const firstTask = pages.tasksPage.tasks.row(1, 1);
    firstTask.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('To do');
    });

    firstTask.link().should('exist');
    firstTask.title().should('not.exist');

    //---------------------------------------------------------------
    // second task should have status `To do` and no link
    //---------------------------------------------------------------
    const secondTask = pages.tasksPage.tasks.row(1, 2);
    firstTask.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('To do');
    });

    secondTask.link().should('not.exist');
    secondTask.title().should('exist');
  });

  it('user cannot start task #2 (or any task apart from #1), if task #1 is in progress', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioYourTeam().click();

    // assign first task
    let firstTask = pages.tasksPage.tasks.row(1, 1);
    firstTask.link().click();

    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputInProgress().click();
    pages.taskPage.submitButton().click();

    pages.tasksPage.filterRadioAllTasks().click();

    //---------------------------------------------------------------
    // first task should have status `In progress`
    //---------------------------------------------------------------
    firstTask = pages.tasksPage.tasks.row(1, 1);
    firstTask.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress');
    });

    //---------------------------------------------------------------
    // second task should have status `To do` and no link
    //---------------------------------------------------------------
    const secondTask = pages.tasksPage.tasks.row(1, 2);
    secondTask.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('To do');
    });

    secondTask.link().should('not.exist');
    secondTask.title().should('exist');

    //---------------------------------------------------------------
    // manually navigating to task #2 page should redirect to tasks page
    //---------------------------------------------------------------
    cy.visit(relative(`/case/${dealId}/tasks/1/2`));
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
  });

  it('user can start task #2 if task #1 is completed', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioYourTeam().click();

    // assign first task and mark as done
    let firstTask = pages.tasksPage.tasks.row(1, 1);
    firstTask.link().click();

    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputDone().click();
    pages.taskPage.submitButton().click();

    pages.tasksPage.filterRadioAllTasks().click();

    //---------------------------------------------------------------
    // first task should have status `Done`
    //---------------------------------------------------------------
    firstTask = pages.tasksPage.tasks.row(1, 1);
    firstTask.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Done');
    });

    //---------------------------------------------------------------
    // second task should have status `To do` and link
    //---------------------------------------------------------------
    let secondTask = pages.tasksPage.tasks.row(1, 2);
    secondTask.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('To do');
    });

    secondTask.link().should('exist');
    secondTask.title().should('not.exist');

    // start second task
    secondTask.link().click();

    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputInProgress().click();
    pages.taskPage.submitButton().click();

    pages.tasksPage.filterRadioAllTasks().click();

    //---------------------------------------------------------------
    // second task should have status 'In progress' and link
    //---------------------------------------------------------------
    secondTask = pages.tasksPage.tasks.row(1, 2);
    secondTask.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress');
    });

    secondTask.link().should('exist');
    secondTask.title().should('not.exist');
  });

  it('user can assign a task to someone else', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioYourTeam().click();
    let firstTask = pages.tasksPage.tasks.row(1, 1);
    firstTask.link().click();

    const differentUserInSameTeam = usersInTeam.find((u) => u.username !== businessSupportUser.username);

    assignTaskToSomeoneElseInMyTeam(dealId, differentUserInSameTeam).then((userObj) => {
      const { firstName, lastName } = userObj;
      cy.wait(100); // for some reason this prevents flaky test

      pages.tasksPage.filterRadioYourTeam().click();

      //---------------------------------------------------------------
      // updated task displays correct assignee and status in the task page
      //---------------------------------------------------------------
      firstTask = pages.tasksPage.tasks.row(1, 1);
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

    const firstTask = pages.tasksPage.tasks.row(1, 1);
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

    // change task assignee and status, click 'close without saving'
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

      // all default AIN tasks are assigned to the test users team
      pages.tasksPage.tasksTableRows().should('have.length', TOTAL_DEFAULT_AIN_TASKS);

      // assign a task to someone else on my team
      const firstTask = pages.tasksPage.tasks.row(1, 1);
      firstTask.link().click();

      const differentUserInSameTeam = usersInTeam.find((u) => u.username !== businessSupportUser.username);

      assignTaskToSomeoneElseInMyTeam(dealId, differentUserInSameTeam).then(() => {
        cy.wait(100); // for some reason this prevents flaky test

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

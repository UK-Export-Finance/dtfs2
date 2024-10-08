import { TASKS } from '../../fixtures/constants';
import pages from '../pages';
import relative from '../relativeURL';

export const commonTestUnderwriterTasksAssignedToUser = (dealId, user) => {
  const fullname = user === TASKS.UNASSIGNED ? TASKS.UNASSIGNED : `${user.firstName} ${user.lastName}`;

  cy.visit(relative(`/case/${dealId}/tasks`));
  pages.tasksPage.tasks.row(2, 1).assignedTo().contains(fullname);
  pages.tasksPage.tasks.row(3, 1).assignedTo().contains(fullname);
  pages.tasksPage.tasks.row(3, 2).assignedTo().contains(fullname);

  // Go back to original location to continue user journey.
  cy.go('back');
};

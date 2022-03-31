# Trade Finance Manager Tasks

In order to process a deal, TFM has a list of tasks that teams need to complete. This is a manual process - each task can be changed to "To do", "In progress", or "Done", and assigned to a TFM user. The long term vision is to automate these tasks and remove as much manual tasks as possible.

For an automatic (AIN) deal, there are only a few tasks. For a manual deal (MIA), there are many more - currently 14.

Tasks are setup in groups. For example, a manual deal has 4 groups of tasks. An automatic deal only has 1 group of tasks.

## How and what happens when tasks are created

When a deal is submitted to TFM, the following happens:

- All tasks are created and added to the deal under `deal.tfm.tasks`
- All tasks have a status of "Cannot start yet", except for the first task
- The first task is marked as "To do"
- An email is sent out to the team that owns the first task, notifying them that the task is ready to start.

## Conditionally added tasks

There are currently 2 tasks that are conditionally added depending on what data the deal has. This happens on deal submission when the tasks are created.

- If the deal does not have an exporter party URN (`deal.tfm.parties.exporter.partyUrn`), an extra task is added: "Match or create the parties".
- If the deal's eligibility criteria has criterion 11 answered as false, an extra task is added: "Complete an agent check"

## Completing tasks

The general rule is that no task can be started unless the previous task is completed - tasks must be completed sequentially.

When task number 1 is completed, task number 2 becomes unlocked (status changes from "Cannot start yet" to "To do"). An email is sent out to the team that owns the unlocked task, notifying them that the task is ready to start. We also add an `emailSent` flag to a task that has sent an email - this prevents ensures no duplicate emails are sent in the future.

This applies to all tasks in all groups. Some example scenarios:

- If there are 4 groups of tasks, group 1 has 3 tasks and no tasks have been completed yet, the only task that can be changed is the first task.
- If there are 4 groups of tasks, group 1 has 3 tasks and the first task has been completed, the only task that can be changed is the second task.
- If all tasks in group 1 are completed, the only task that can be changed is the next task - in this case it'd be the first task in the second group.

## :warning: Special business rules

### Automatically updated deal stage

When the first task is updated to either "In progress" or "Done", the tasks controller updates the TFM deal stage to "In progress by UKEF"

### Automatically assign all tasks in multiple groups to the Lead Underwriter

In the TFM UI there is the ability to assign a Lead Underwriter. When this happens, a function called `assignGroupTasksToOneUser` is called. This assigns all tasks in group 2 and 3, to the Lead Underwriter.

### :warning: Mutiple unlocked tasks

There is a business rule that defies the default sequential behaviour described above.

Currently, there is a task that once completed, will unlock _all tasks in the next group_.

This task is called "Complete an adverse history check". When this is completed, all tasks in the next group (Underwriting Group) become unlocked. Any tasks in the Underwriting Group can then be completed in any order.

All other tasks _after_ this group follow the default sequential behaviour. In other words, the first task in the next group cannot be started until _all_ tasks in the previous group (Underwriting Group), have been completed.

One interesting difference here that's baked into the code is that - the last task in the Underwriting Group could be completed without the other Underwriting tasks being completed. This does not unlock the next task (like the default sequential behaviour). _All tasks_ in this especially-unlocked group need to be completed before the next group can be started.

## Tasks model/structure

Example of a fully populated, single task:

```js
{
  id: '1',
  groupId: 1,
  title: 'Match or create the parties in this deal',
  team: {
    id: 'BUSINESS_SUPPORT',
    name: 'Business support group',
  },
  status: 'In progress',
  assignedTo: {
    userId: '1234',
    userFullName: 'Joe Bloggs',
  },
  emailSent: true,
  dateStarted: 1606900616651,
  dateCompleted: 1606900616651,
  history: [
    {
      statusFrom: 'To do',
      statusTo 'in progress,
      assignedUserId: '1234',
      updatedBy: '1234',
      timestamp: 13345665,
    },
  ],
}
```

Note: the default value for all properties in `assignedTo` is "Unassigned".

## Groups structure

Simple example of 2 groups with multiple tasks

```js
[
  {
    groupTitle: 'Group A',
    id: 1,
    groupTasks: [
      { id: '1', title: 'Task number 1', ... },
      { id: '2', title: 'Task number 2', ... },
      { id: '3', title: 'Task number 1', ... },
    ],
  },
  {
    groupTitle: 'Group B',
    id: 1,
    groupTasks: [
      { id: '1', title: 'Task number 1', ... },
      { id: '2', title: 'Task number 2', ... },
    ],
  },
]
```

## The code

### Functions for creating tasks

| File | Function | Purpose
| ------- | ------- | ------- |
| /v1/controllers/deal.tasks.js | createDealTasks | Creates all tasks (with conditions depending on the deal). Calls API to update the deal.
| /v1/helpers/create-tasks.js | createTasks | Generates an array of all tasks. Handles AIN/MIA specifics.

### Main functions for updating tasks

| File | Function | Purpose
| ------- | ------- | ------- |
| /v1/controllers/tasks.controller.js | updateTfmTask | Core function to update a single task and map over all other tasks to apply business logic.
| /v1/controllers/tasks.controller.js | updateTask | Maps over all tasks and updates a single task from the provided params.
| /v1/controllers/tasks.controller.js | updateAllTasks | Maps over all tasks applying business logic to each task as appropriate.

### Helper functions for updating tasks

| File | Function | Purpose
| ------- | ------- | ------- |
| /v1/tasks/tasks-edit-logic.js | handleTaskEditFlagAndStatus | Updates a single task's `canEdit` and `status` properties depending on the shape of the provided task and other tasks. lots of business logic in here. This is called for each task from the main `updateTfmTask` function.
| /v1/tasks/tasks-edit-logic.js | taskCanBeEditedWithoutPreviousTaskComplete | Special business rules to check if a task can be edited without previous tasks completed. This currently only applies to one group of tasks (Underwriting Group). Can be easily extended for other tasks/groups.
| /v1/tasks/tasks-edit-logic.js | previousTaskIsComplete | From a provided task and group id - check if the previous task is completed. Handles things like if the task is not in the same group as the provided task.
| /v1/tasks/map-task-history-object.js | mapTaskHistoryObject | adds a timestamp to some task fields, to be used in a single task's history array.
| /v1/tasks/map-task-object.js | mapTaskObject | Maps received data into correct format for the DB. E.g, updates the status, changes the original status to be the `previousStatus`, adds timestamps.
| /v1/tasks/assign-group-tasks-to-one-user.js | assignGroupTasksToOneUser | From a provided list of groups and userId - assign all tasks in the groups to the provided user. Calls the API to get full user name and update the deal.

There are also a series of smaller, more generic helper functions in `/src/v1/helpers/tasks.js` that are used in all the functions listed above:

- `getFirstTask`
- `getTaskInGroupById`
- `getTaskInGroupByTitle`
- `getGroupById`
- `getGroupByTitle`
- `isFirstTaskInAGroup`
- `isFirstTaskInFirstGroup`
- `groupHasAllTasksCompleted`
- `taskIsCompletedImmediately`
- `isAdverseHistoryTaskIsComplete`
- `shouldUpdateDealStage`

### Task email functions

| File | Function | Purpose
| ------- | ------- | ------- |
| /v1/controllers/task-emails.js | sendUpdatedTaskEmail | Maps a given task with a Notify template id and sends the email.
| /v1/helpers/generate-task-email-variables.js | generateTaskEmailVariables | Formats task title, generates a URL and grabs some deal data.

### What happens in the code when a single task is updated

When a TFM user updates a task (e.g changes the status, assigns the task to someone), the UI calls the TFM API via GraphQL. The GraphQL resolver simply calls the `updateTfmTask` function (with the single task that has changed with user input). This triggers a series of events for the all tasks.

1) Get the deal and all tasks from DB
2) Finds the group that the task belongs to
3) Maps the user-inputted task input, into the Task schema structure, adding a few fields like `dateStarted`, `dateCompleted`, `statusFrom`
4) Checks if the task can be updated (i.e, previous task is complete)
5) Updates the task in that group. Function now has an array of all the latest tasks (not saved to DB yet)
6) Map over _all tasks_ (including the one task that has been updated) via `updateAllTasks`. This function:

- Unlocks the next task if the previous task is completed and the next task is not already unlocked. Changes `task.status` and `task.canEdit`.
- Makes sure that if a task is completed, mark `task.canEdit` as false.
- The above logic happens via `handleTaskEditFlagAndStatus` function, which handles and applies the business rules and task property changes to an individual task. It also return a `sendEmail` flag if the task has been unlocked. This is the core, basic functionality for all tasks.
- if the task that is being mapped over is the task that has been requested to update - update the tasks's history array with the status changed, who it's assigned to, and who updated it.
- if the `handleTaskEditFlagAndStatus` function returned a `sendEmail` flag, add the task to an array of emails to send.
  
7) Unlock any tasks with special business rules (e.g when X task is completed, unlock multiple tasks in Y group). Currently the only logic for this is inside the `canUnlockUnderWritingGroupTasks` conditional.
8) Loop over the array of emails to send (that was returned previously), make an API call for each task.
9) For each task that has successfully sent email - add the task to a new array: `tasksToAddEmailSentFlag`.
10) Map over all the tasks again and if the task matches a task in the `tasksToAddEmailSentFlag` array, update the task with a `emailSent` flag. This flag is a fail-safe to ensure that duplicate emails are not set.
11) Finally, return all tasks

## Future

### Extending multiple unlocked tasks

If in the future there is a requirement to unlock multiple tasks if X task is completed, this can be relatively easily achieved by following the same pattern as the existing logic. Would need to:

- extract or extend the function/logic in the `canUnlockUnderWritingGroupTasks` condition, inside the `updateAllTasks` function.
- add the special groups (that can be completed without previous tasks being completed), to the `taskCanBeEditedWithoutPreviousTaskComplete` function inside `tasks-edit-logic.js`.

### Adding permission to tasks

Currently for V1, there are no restrictions in place for who can edit and assign tasks. For example, a task assigned to Team A, could be changed by someone in Team B. There is a history array in each task so that if a user changes something they're not supposed to, we could find out who changed what. Ideally we will prevent a user from doing this in the first place.

Recommendations/notes for adding this functionality:

- UI: map the tasks that are rendered in the UI with the currently logged in user so that flags are added. Then, only render links to tasks that they have access to.
- UI: add router auth checks so that if a user goes to an individual task page/route, one of the following happens:
  - user is redirected to an unauth page
  - the individual task page is rendered, but no form submit/functionality is displayed
- API: add middleware/checks so that the update endpoint (GraphQL), cannot be called if the requesting user cannot edit the task. Otherwise, logic will need to be added to the `updateTfmTask` function to prevent it from running.
- API: If we can prevent the user from getting to this function, this will save changing the current `canEdit` boolean flag. Otherwise, `canEdit` could be changed (or an additional property added) to have an array of users who _could_ edit the task.

### New instances of tasks

Currently there is just one set of tasks generated for a deal on submission. If a new set of tasks needs to be generated for a different business process/flow (for example with the upcoming Ammendments functionality), I recommend not touching the existing `deal.tfm.tasks` (mostly to retain it historically), and instead creating a new array, for example `deal.tfm.ammendmentTasks` or `deal.tfm.ammendments.tasks`. Then, we'd just need to create some new constants for the new tasks, and pass them into a new function similar to `createDealTasks`. The tasks logic should work just fine as long as the structure is the same.

# Trade Finance Manager Tasks

In order to process a deal, TFM has a list of tasks that teams need to complete. This is a manual process - each task can be changed to "To do", "In progress", or "Done", and assigned to a TFM user. The long term vision is to automate these tasks and remove as much manual tasks as possible.

For an automatic (AIN) deal, there are only a few tasks. For a manual deal (MIA, MIN), there are many more - currently 14.

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

When task number 1 is completed, task number 2 becomes unlocked (status changes from "Cannot start yet" to "To do"). An email is sent out to the team that owns the unlocked task, notifying them that the task is ready to start.

This applies to all tasks in all groups. Some example scenarios:

- If there are 4 groups of tasks, group 1 has 3 tasks and no tasks have been completed yet, the only task that can be changed is the first task.
- If there are 4 groups of tasks, group 1 has 3 tasks and the first task has been completed, the only task that can be changed is the second task.
- If all tasks in group 1 are completed, the only task that can be changed is the next task - in this case it'd be the first task in the second group.

## :warning: Special business rule(s)

### Mutiple unlocked tasks

There is a business rule that defies the default sequential behaviour described above.

Currently, there is a task that once completed, will unlock _all tasks in the next group_.

This task is called "Complete an adverse history check". When this is completed, all tasks in the next group (Underwriting Group) become unlocked. Any tasks in the Underwriting Group can then be completed in any order.

All other tasks _after_ this group follow the default sequential behaviour. In other words, the first task in the next group cannot be started until _all_ tasks in the previous group (Underwriting Group), have been completed.

### TODO: confirm this:
One interesting difference here that's baked into the code is that - the last task in the Underwriting Group could be completed without the other Underwriting tasks being completed. This does not unlock the next task (like the default sequential behaviour). _All tasks_ in this especially-unlocked group need to be completed before the next group can be started.

### Automatically updated the deal stage

When the first task is updated to either "In progress" or "Done", the tasks controller updates the TFM deal stage to "In progress by UKEF"

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
  history: [
    {
      {
      id: '1',
      groupId: 1,
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

## TODO:

## Task functions

- list of main task functions and what their purpose is.

## What happens in the code when a task is updated

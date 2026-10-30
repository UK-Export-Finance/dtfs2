/**
 * Add an emailSent flag to the first task.
 * This prevents multiple emails from being sent.
 */
const addFirstTaskEmailSentFlag = (emailResponse, tasks) => {
  const modifiedTasks = tasks;

  if (!emailResponse.errors) {
    modifiedTasks.map((group) => {
      const modifiedGroup = group;

      if (group.id === 1) {
        modifiedGroup.groupTasks[0].emailSent = true;
      }

      return modifiedGroup;
    });
  }

  return modifiedTasks;
};

module.exports = addFirstTaskEmailSentFlag;

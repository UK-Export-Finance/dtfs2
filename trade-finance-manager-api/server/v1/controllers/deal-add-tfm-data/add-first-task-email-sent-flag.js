/**
 * Add an emailSent flag to the first task.
 * This prevents multiple emails from being sent.
 */
const addFirstTaskEmailSentFlag = (emailResponse, tasks) => {
  const modifiedTasks = tasks;

  if (!emailResponse.errors) {
    modifiedTasks.map((group) => {
      const modifiedgGroup = group;

      if (group.id === 1) {
        modifiedgGroup.groupTasks[0].emailSent = true;
      }

      return modifiedgGroup;
    });
  }

  return modifiedTasks;
};

module.exports = addFirstTaskEmailSentFlag;

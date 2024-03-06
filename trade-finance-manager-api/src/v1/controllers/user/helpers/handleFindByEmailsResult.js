const handleFindByEmailsResult = (users) => {
  if (!users) {
    return { found: false };
  }

  if (users.length === 0) {
    console.info('Getting TFM user by emails - no user found');

    return { found: false };
  }

  if (users.length > 1) {
    console.info('Getting TFM user by emails - More than 1 matching user found: %O', users);

    return { found: true, canProceed: false };
  }

  if (users[0].disabled) {
    // TODO: should we remove functionality to disable users in TFM, so disabling is done in Active directory.
    console.info('Getting TFM user by emails - User is disabled: %O', users[0]);

    return { found: true, canProceed: false };
  }

  if (users[0].status === 'blocked') {
    // TODO: should we remove functionality to block users in TFM, so block is done in Active directory.
    console.info('Getting TFM user by emails - User is blocked: %O', users[0]);

    return { found: true, canProceed: false };
  }

  return {
    found: true,
    canProceed: true,
    ...users[0],
  };
};

module.exports = handleFindByEmailsResult;

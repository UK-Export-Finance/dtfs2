const teamMembersReducer = (teamMembers) => {
  const result = teamMembers.map((user) => {
    const {
      _id,
      firstName,
      lastName,
    } = user;

    return {
      _id,
      firstName,
      lastName,
    };
  });

  return result;
};

module.exports = teamMembersReducer;

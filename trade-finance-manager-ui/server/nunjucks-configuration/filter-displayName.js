const displayName = (person) => {
  let response = '-';

  if (person && person !== null && person.lastName !== null) {
    response = `${person.firstname} ${person.lastName}`;
  }

  return response;
};

module.exports = displayName;

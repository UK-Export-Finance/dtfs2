const displayName = (person) => {
  let response = '-';

  if (person && person !== null && person.surname !== null) {
    response = `${person.firstname} ${person.surname}`;
  }
  return response;
};

module.exports = displayName;

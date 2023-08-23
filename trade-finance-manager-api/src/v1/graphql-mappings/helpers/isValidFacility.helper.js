const isValidFacility = (facility) => {
  const isValid = facility?.facilitySnapshot && facility?.tfm && facility?._id;

  return isValid;
};

module.exports = isValidFacility;

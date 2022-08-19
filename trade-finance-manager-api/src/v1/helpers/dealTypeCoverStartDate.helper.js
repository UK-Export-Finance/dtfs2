// checks for coverStartDate and returns based on deal-type as stored differently
const dealTypeCoverStartDate = (facilitySnapshot) => {
  // if exists - GEF
  if (facilitySnapshot?.coverStartDate) {
    return facilitySnapshot.coverStartDate;
  }

  let dateConstructed;

  if (facilitySnapshot['requestedCoverStartDate-year'] && facilitySnapshot['requestedCoverStartDate-month'] && facilitySnapshot['requestedCoverStartDate-day']) {
  // BSS stored as separate year month day values
    dateConstructed = new Date(
      facilitySnapshot['requestedCoverStartDate-year'],
      facilitySnapshot['requestedCoverStartDate-month'] - 1,
      facilitySnapshot['requestedCoverStartDate-day'],
    );
  } else {
    dateConstructed = new Date(parseInt(facilitySnapshot.requestedCoverStartDate, 10));
  }

  return dateConstructed;
};

module.exports = dealTypeCoverStartDate;

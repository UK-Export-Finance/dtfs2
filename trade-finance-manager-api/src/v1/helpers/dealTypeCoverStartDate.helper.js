// checks for coverStartDate and returns based on deal-type as stored differently
const dealTypeCoverStartDate = (facilitySnapshot) => {
  const { coverStartDate } = facilitySnapshot;

  // if exists - gef
  if (coverStartDate) {
    return coverStartDate;
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

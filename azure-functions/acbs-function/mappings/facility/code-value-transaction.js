/*
  "portfolioIdentifier": "E1",
  "facilityIdentifier":  UKEF facilityId,
  "lenderTypeCode": "100" or "500" *Ensure code we are using 100 as 500 will not activate the facility confirmed with IJ,
  "initialBundleStatusCode": 2 or 3, Should now be set to 3
  "initiatingUserName": "APIUKEF",
  "accountOwnerIdentifier": "00000000",
  "effectiveDate": "2020-06-01",
  "facilityTransactionCodeValueCode": "A",
  "facilityTransactionTypeCode": "2340",
  "isDraftIndicator": false,
  "limitKeyValue": "00210652",
  "limitTypeCode": "00",
  "sectionIdentifier": "00"
 */

const codeValueTransaction = (deal, facility) => {
  const {
    effectiveDate,
  } = facility.tfm.facilityGuaranteeDates;

  return {
    facilityIdentifier: facility.ukefFacilityID !== undefined
      ? facility.ukefFacilityID.padStart(10, 0)
      : facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    lenderTypeCode: '100',
    initialBundleStatusCode: 3,
    portfolioIdentifier: 'E1',
    effectiveDate,
    initiatingUserName: 'APIUKEF',
    facilityTransactionCodeValueCode: 'A',
    facilityTransactionTypeCode: '2340',
    limitTypeCode: '00',
  };
};

module.exports = codeValueTransaction;

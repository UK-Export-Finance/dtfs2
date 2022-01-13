const { generateIssuedFacilitiesListString } = require('./send-issued-facilities-received-email');
const { capitalizeFirstLetter } = require('../../utils/string');

describe('send-issued-facilities-received-email - generateIssuedFacilitiesListString', () => {
  it('should return a list in a formatted string', () => {
    const facilities = [
      {
        facilityType: 'Bond',
        ukefFacilityId: '1',
      },
      {
        facilityType: 'Loan',
        ukefFacilityId: '2',
      },
    ];

    const facility1Type = capitalizeFirstLetter(facilities[0].facilityType);
    const facility1Id = facilities[0].ukefFacilityId;

    const facility2Type = capitalizeFirstLetter(facilities[1].facilityType);
    const facility2Id = facilities[1].ukefFacilityId;

    const expected = `- ${facility1Type} facility with UKEF facility reference: ${facility1Id}\n- ${facility2Type} facility with UKEF facility reference: ${facility2Id}`;

    const result = generateIssuedFacilitiesListString(facilities);

    expect(result).toEqual(expected);
  });
});

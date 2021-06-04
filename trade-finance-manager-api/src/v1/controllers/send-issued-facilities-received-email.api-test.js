const { generateFacilitiesListString } = require('./send-issued-facilities-received-email');
const { capitalizeFirstLetter } = require('../../utils/string');

describe('send-issued-facilities-received-email - generateFacilitiesListString', () => {
  it('should return a list in a formatted string', () => {
    const facilities = [
      {
        facilityType: 'bond',
        ukefFacilityID: '1',
      },
      {
        facilityType: 'loan',
        ukefFacilityID: '2',
      },
    ];

    const facility1Type = capitalizeFirstLetter(facilities[0].facilityType);
    const facility1Id = facilities[0].ukefFacilityID;

    const facility2Type = capitalizeFirstLetter(facilities[1].facilityType);
    const facility2Id = facilities[1].ukefFacilityID;

    const expected = `- ${facility1Type} facility with UKEF facility reference: ${facility1Id}\n - ${facility2Type} facility with UKEF facility reference: ${facility2Id}`;

    const result = generateFacilitiesListString(facilities);

    expect(result).toEqual(expected);
  });
});

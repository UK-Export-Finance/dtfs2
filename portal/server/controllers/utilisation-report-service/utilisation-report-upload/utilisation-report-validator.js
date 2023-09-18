// We should validate the data and the data will look something like
// const data = {
//     "facility utilisation": "",
//     "ukef facility id": "",
//     "base currency": "",
//     "total fees accrued for the month": "",
//     "monthly fees paid to ukef": "",
// }

// 'UKEF Facility ID' column mandatoryType
// Type - Number
// Min - 8 Characters
// Max - 10 Characters
// Must be unique - false

// 'Base Currency' column mandatory
// Type - Integer
// Min - 3 characters
// Max - 3 characters
// Must be unique - false
// Validate with ISO 4217 currency codes

// 'Facility Utilisation' column mandatory
// Type - Number
// Min - 1
// Max - 30
// Must be unique - false

// 'Total fees accrued for the month' column mandatory
// Type - Number
// Min - 1
// Max - 30
// Must be unique - false

// 'Monthly fees paid to UKEF' column mandatory
// Type - Number
// Min - 1
// Max - 30
// Must be unique - false

const validateCsvData = (csvData) => {
    const validationErrors = [];

    const errors = validateCsvHeaders(csvData);

    return validationErrors;
};

const validateUkefFacilityId = (csvData) => {
    const hasColumn = Object.keys(csvData[0]).some((objectKey) => objectKey.toLowerCase() === 'ukef facility id')
    if (!hasColumn) {
        return {error: '', missingHeader: true}
    }
    const errors = csvData.filter(() => {

    }).map(() => {})
}
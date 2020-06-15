// conditionalErrorList pattern is:
/*
const conditionalErrorList = {
  fieldName: {
    possibleFieldValue: {
      requiredFieldWhenThisValueIsSet: {
        text: 'Enter X Field',
      },
      requiredFieldWhenThisValueIsSet: {
        text: 'Enter Y Field',
      },
    },
    possibleFieldValue: {
      requiredFieldWhenThisValueIsSet: {
        text: 'Enter Z Field ',
      }
    },
  },
}
*/

module.exports = {
  facilityStage: {
    Conditional: {
      ukefGuaranteeInMonths: {
        text: 'Enter the Length of time that the UKEF\'s guarantee will be in place for',
      },
    },
    Unconditional: {
      bankReferenceNumber: {
        text: 'Enter the Bank reference number',
      },
      requestedCoverStartDate: {
        text: 'Enter the Requested Cover Start Date',
      },
      coverEndDate: {
        text: 'Enter the Cover End Date',
      },
    },
  },
  currencySameAsSupplyContractCurrency: {
    false: {
      currency: {
        text: 'Enter the Currency',
      },
      conversionRate: {
        text: 'Enter the Conversion rate',
      },
      conversionRateDate: {
        text: 'Enter the Conversion rate date',
      },
    },
  },
};

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
  bondStage: {
    Unissued: {
      ukefGuaranteeInMonths: {
        text: 'Enter the Length of time that the UKEF\'s guarantee will be in place for',
      },
    },
    Issued: {
      coverEndDate: {
        text: 'Enter the Cover End Date',
      },
      uniqueIdentificationNumber: {
        text: 'Enter the Bond\'s unique identification number',
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

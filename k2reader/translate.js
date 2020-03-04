const xml2js = require('xml2js');
const translate = require('./translate');

const parseString = xml2js.parseStringPromise;


module.exports = async (xmlContent) => {
  const k2Json = await parseString(xmlContent);
  const ourJson = await map(k2Json);

  return ourJson;
};

const map = async (k2Json) => {
  const k2Deal = k2Json.Deal;

  let mapped = {
    supplyContractName: k2Deal.Deal_information[0].Exporter_and_indemnifier[0].Exporter_name[0],
    id:                 k2Deal.$.portal_deal_id,
    details: {
      bankSupplyContractID: k2Deal.$.bank_deal_id,
      ukefDealId:           "NEEDS-MAPPING", //[dw] think this is irrelevant until we've picked up a response from k2
      status:               "NEEDS-MAPPING", //[dw] think this is irrelevant until we've picked up a response from k2
      previousStatus:       "NEEDS-MAPPING", //[dw] ????
      maker:                "NEEDS-MAPPING",
      checker:              "NEEDS-MAPPING",
      submissionDate:       "NEEDS-MAPPING",
      dateOfLastAction:     "NEEDS-MAPPING",
      submissionType:       "NEEDS-MAPPING"
    },
    aboutSupplyContract:  {
      status:               "NEEDS-MAPPING"
    },
    eligibility: {
      status:               "NEEDS-MAPPING",
      submissionType:       "NEEDS-MAPPING",
      criteria: [{ // need to understand where this reference data comes from and what it is referring to in the xml... assume it's <Eligibility_checklist/>
          id: 11,
          description: "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate."
        }, {
          id: 12,
          description: "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor."
        }, {
          id: 13,
          description: "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn)."
        }, {
          id: 14,
          description: "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced."
        }, {
          id: 15,
          description: "The Requested Cover Start Date is no more than three months from the date of submission."
        }, {
          id: 16,
          description: "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate."
        }, {
          id: 17,
          description: "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person."
        }, {
          id: 18,
          description: "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF."
        }
      ],
      completedStatus: {
        eligibilityCriteria:      "NEEDS-MAPPING",
        supportingDocumentation:  "NEEDS-MAPPING"
      }
    },
    bondTransactions: {
      items: [
        {
          id: "1",
          bankReferenceNumber: "Not entered",
          ukefFacilityID: "12345678",
          value: "GBP 123,456.00",
          stage: "Unconditional",
          startDate: "12/02/2020",
          endDate: "14/03/2027",
          action: "?",
          completedStatus: {
            bondDetails: false,
            bondFinancialDetails: false,
            feeDetails: false
          }
        }, {
          id: "2",
          bankReferenceNumber: "test",
          ukefFacilityID: "12345678",
          value: "GBP 123,456.00",
          stage: "Unconditional",
          startDate: "12/02/2020",
          endDate: "14/03/2027",
          action: "?",
          completedStatus: {
            bondDetails: false,
            bondFinancialDetails: false,
            feeDetails: false
          }
        }
      ]
    },
    loanTransactions: {
      items: [
        {
          id: "1",
          bankReferenceNumber: "Not entered",
          ukefFacilityID: "12345678",
          status: "Not started",
          value: "GBP 123,456.00",
          stage: "Unconditional",
          startDate: "12/02/2020",
          endDate: "14/03/2027",
          action: "?",
          completedStatus: {
            bondDetails: true,
            bondFinancialDetails: false,
            feeDetails: false
          }
        }, {
          id: "2",
          bankReferenceNumber: "test",
          ukefFacilityID: "12345678",
          status: "Incomplete",
          value: "GBP 123,456.00",
          stage: "",
          startDate: "",
          endDate: "",
          action: "?",
          completedStatus: {
            bondDetails: false,
            bondFinancialDetails: false,
            feeDetails: false
          }
        }
      ]
    },
    summary: {
      dealCurrency: "USD",
      totals: {
        bonds: "100",
        loans: "200",
        transactions: "300"
      },
      dealBondsLoans: {
        totalValue: {
          dealCurrency: "1.23",
          dealInGbp: "1.23",
          bondCurrency: "1.23",
          bondInGbp: "1.23",
          loanCurrency: "1.23",
          loanInGbp: "1.23"
        },
        totalUkefExposure: {
          dealCurrency: "1.23",
          dealInGbp: "1.23",
          bondCurrency: "1.23",
          bondInGbp: "1.23",
          loanCurrency: "1.23",
          loanInGbp: "1.23"
        }
      }
    },
    comments: [
      {
        firstName: "Durga",
        lastName: "Rao",
        created: "12/02/2020 - 13:00",
        body: "Test comment"
      }, {
        firstName: "Joe",
        lastName: "Bloggs",
        created: "13/02/2020 - 10:00",
        body: "<a href=\"https://staging.ukexportfinance.gov.uk\">https://staging.ukexportfinance.gov.uk</a>"
      }
    ],
    submissionDetails: {
      supplierType:                             "Exporter", //TODO?
      supplierCompaniesHouseRegistrationNumber: k2Deal.Deal_information[0].Exporter_and_indemnifier[0].Exporter_co_hse_reg_number[0],
      supplierName:                             k2Deal.Deal_information[0].Exporter_and_indemnifier[0].Exporter_name[0],
      supplierAddress:                          k2Deal.Deal_information[0].Exporter_and_indemnifier[0].Exporter_postcode[0],
      suppliersCorrespondenceAddressDifferent:  false,  //TODO?
      industrySector:                           k2Deal.Deal_information[0].Exporter_and_indemnifier[0].Industry_sector_code[0],
      industryClass:                            k2Deal.Deal_information[0].Exporter_and_indemnifier[0].Industry_class_code[0],
      smeType:                                  k2Deal.Deal_information[0].Exporter_and_indemnifier[0].Sme_type[0],
      supplyContractDescription:                k2Deal.Deal_information[0].Exporter_and_indemnifier[0].Description_of_export[0],
      legallyDistinct:                          false,  //TODO?
      buyer: {
        name:                                     k2Deal.Deal_information[0].Buyer[0].Buyer_name[0],
        country:                                  k2Deal.Deal_information[0].Buyer[0].Buyer_country_name[0], //TODO xml talks about code+name for this, so we probably need some reference data+mappings
        goodsServicesDestination:                 k2Deal.Deal_information[0].Buyer[0].Destination_country_label[0], //TODO xml talks about code+label for this, so we probably need some reference data+mappings
      },
      supplyContractFinancials: {
        value:                                    k2Deal.Deal_information[0].Financial[0].Contract_value[0],
        currency:                                 k2Deal.Deal_information[0].Financial[0].Deal_currency_name[0], //TODO xml has code+name here, so mapping likely needed
        conversionRateToGBP:                      k2Deal.Deal_information[0].Financial[0].Conversion_rate[0], //TODO -assuming- "conversion_rate" == "conversionRateToGBP".. shold check; getting it upsidedown would be embarrassing
        conversionDate:                           k2Deal.Deal_information[0].Financial[0].Conversion_date[0],
      },
      bond: {
        issuer:                                   k2Deal.Facilities[0].BSS[0].BSS_Guarantee_details[0].BSS_issuer[0], //TODO guesswork... + looks like we have more reference data here
        type:                                     k2Deal.Facilities[0].BSS[0].BSS_Guarantee_details[0].BSS_type[0], //TODO guesswork...+ looks like we have more reference data here
        stage:                                    k2Deal.Facilities[0].BSS[0].BSS_Guarantee_details[0].BSS_stage[0], //TODO guesswork...+ looks like we have more reference data here
        cover: {
          requestedStartDate:                     "NEEDS-MAPPING",
          endDate:                                "NEEDS-MAPPING"
        },
        uniqueIdentificationNumber:             k2Deal.Facilities[0].BSS[0].UKEF_BSS_facility_id[0], //TODO guesswork...
        beneficiary:                            k2Deal.Facilities[0].BSS[0].BSS_Guarantee_details[0].BSS_beneficiary[0], //TODO guesswork...
        financial: {
          value:                                  k2Deal.Facilities[0].BSS[0].BSS_Financial_details[0].BSS_value[0], //TODO guesswork...
          transactionCurrencySameAsSupplyContractCurrency: true, //TODO feels like a UI toggle that should have real data under it?
          riskMarginFee:              "3%",  //TODO no idea
          coveredPercentage:          "50%", //TODO no idea
          minimumRiskMarginFee:       "0.00", //TODO no idea
          guaranteeFeePayableByBank:  "2.7000%", //TODO no idea
          uKefExposure:               "0.50" //TODO no idea
        },
        fee: {
          type:                                   k2Deal.Facilities[0].BSS[0].BSS_Dates_repayments[0].BSS_premium_type[0], //TODO guesswork...
          frequency:                              k2Deal.Facilities[0].BSS[0].BSS_Dates_repayments[0].BSS_premium_freq[0], //TODO guesswork...
          dayCountBasis:                          k2Deal.Facilities[0].BSS[0].BSS_Dates_repayments[0].BSS_day_basis[0], //TODO guesswork...
        }
      },
      supportingDocumentation: [    //TODO looks like this is all reference data that probably feeds into the Eligibility_checklist?
        {
          fieldName: "manualInclusionQuestionnaire",
          title: "Manual Inclusion Questionnaire",
          description: "Please upload a completed Manual Inclusion Questionnaire. You can download the template here: <a href=\"#\" class=\"govuk-link\">Manual Inclusion Questionnaire</a>",
          inputType: "file",
          href: "test.pdf",
          value: null
        },
        {
          fieldName: "financialStatements",
          title: "Financial statements for the past 3 years",
          description: "Financial statements (audited if available) for the past 3 years, including a Profit & Loss, Balance Sheet and Cash Flow Statement, (with notes, if applicable). If the company is part of a larger group, separate accounts should be provided for the company and group.",
          inputType: "file",
          href: "test.pdf",
          value: null
        },
        {
          fieldName: "managementAccounts",
          title: "Year to date management accounts",
          description: "Including Profit & Loss, Balance Sheet and Cash Flow where available.",
          inputType: "file",
          href: "test.pdf",
          value: null
        },
        {
          fieldName: "financialForecasts",
          title: "Financial forecasts for the next 3 years",
          description: "Including monthly cash-flow projections for the business as a whole. If unavailable provide for at least the projected facility/guarantee term. If there are any cash flow shortfalls, explain how these will be filled.",
          inputType: "file",
          href: "test.pdf",
          value: null
        },
        {
          fieldName: "financialInformation",
          title: "Brief commentary on the financial information",
          description: "A brief commentary on the financial information in 2-4, with particular focus on turnover, gross and net profit, dividends (if any), debt profile including bank borrowing and net worth, and any other information with explains any exceptions, anomalies or volatility. If the company has experienced any unusual or off-trend financial performance in the last 3 years please also explain this.",
          inputType: "file",
          href: "test.pdf",
          value: null
        },
        {
          fieldName: "corporateStructureDiagram",
          title: "Corporate structure diagram",
          description: "Showing corporate structure including parent, subsidiary and associated companies.",
          inputType: "file",
          href: "test.pdf",
          value: null
        },
        {
          fieldName: "security",
          title: "Security",
          description: "Details of the overarching general facility taken by the bank in relation to the exporter, for example debenture, fixed and floating charge, but not including any security that is specific to the Transaction.",
          inputType: "textarea",
          href: "test.pdf",
          value: null
        }
      ],
      eligibilityCriteria: [     //TODO looks like this is all reference data that probably feeds into the Eligibility_checklist?
        {
          id: 11,
          description: "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.",
          answer: true
        },
        {
          id: 12,
          description: "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.",
          answer: false
        },
        {
          id: 13,
          description: "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).",
          answer: true
        },
        {
          id: 14,
          description: "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.",
          answer: false
        },
        {
          id: 15,
          description: "The Requested Cover Start Date is no more than three months from the date of submission.",
          answer: true
        },
        {
          id: 16,
          description: "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.",
          answer: true
        },
        {
          id: 17,
          description: "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.",
          answer: true
        },
        {
          id: 18,
          description: "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.",
          answer: true
        }
      ]

    },
  };

  return mapped;
};

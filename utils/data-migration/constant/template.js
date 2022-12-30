const deal = {
  deal: {
    _id: {
      $oid: ''
    },
    dealSnapshot: {
      _id: {
        $oid: ''
      },
      status: 'Submitted',
      details: {
        created: {
          $numberLong: '1653305118681'
        },
        submissionCount: 2,
        submissionDate: '1653903032972',
        checker: {
          username: '',
          roles: [
            'checker'
          ],
          bank: {
            id: '',
            name: '',
            emails: [
              ''
            ],
            companiesHouseNo: '',
            partyUrn: ''
          },
          lastLogin: '1653902607187',
          firstname: '',
          surname: '',
          email: '',
          timezone: 'Europe/London',
          'user-status': 'active',
          _id: ''
        },
        ukefDealId: ''
      },
      submissionDetails: {
        status: 'Incomplete',
        'supplier-type': 'UK Supplier',
        'supplier-companies-house-registration-number': '',
        'supplier-name': '',
        'supplier-address-country': {
          name: 'United Kingdom',
          code: 'GBR'
        },
        'supplier-address-line-1': '',
        'supplier-address-line-2': '',
        'supplier-address-line-3': '',
        'supplier-address-town': '',
        'supplier-address-postcode': '',
        'supplier-correspondence-address-is-different': 'false',
        'supplier-correspondence-address-country': {},
        'supplier-correspondence-address-line-1': '',
        'supplier-correspondence-address-line-2': '',
        'supplier-correspondence-address-line-3': '',
        'supplier-correspondence-address-town': '',
        'supplier-correspondence-address-postcode': '',
        'industry-sector': {
          code: '1009',
          name: 'Information and communication'
        },
        'industry-class': {
          code: '63990',
          name: 'Other information service activities n.e.c.'
        },
        'sme-type': 'Medium',
        'supply-contract-description': '',
        legallyDistinct: 'false',
        'indemnifier-companies-house-registration-number': '',
        'indemnifier-name': '',
        'indemnifier-address-country': {},
        'indemnifier-address-line-1': '',
        'indemnifier-address-line-2': '',
        'indemnifier-address-line-3': '',
        'indemnifier-address-town': '',
        'indemnifier-address-postcode': '',
        'indemnifier-correspondence-address-country': {},
        'indemnifier-correspondence-address-line-1': '',
        'indemnifier-correspondence-address-line-2': '',
        'indemnifier-correspondence-address-line-3': '',
        'indemnifier-correspondence-address-town': '',
        'indemnifier-correspondence-address-postcode': '',
        indemnifierCorrespondenceAddressDifferent: '',
        'buyer-name': '',
        'buyer-address-country': {
          name: 'Bulgaria',
          code: 'BGR'
        },
        'buyer-address-line-1': '',
        'buyer-address-line-2': '',
        'buyer-address-line-3': '',
        'buyer-address-town': '',
        'buyer-address-postcode': '',
        destinationOfGoodsAndServices: {
          name: 'Bulgaria',
          code: 'BGR'
        },
        supplyContractValue: '1815750.00',
        supplyContractCurrency: {
          text: 'EUR - Euros',
          id: 'EUR',
          currencyId: 11
        },
        supplyContractConversionRateToGBP: '1.15',
        'supplyContractConversionDate-day': '23',
        'supplyContractConversionDate-month': '05',
        'supplyContractConversionDate-year': '2022',
        supplyContractConversionDate: '23/05/2022',
        viewedPreviewPage: true
      },
      summary: {},
      comments: [],
      editedBy: [],
      facilities: [],
      exporter: {
        companyName: ''
      },
      dealType: 'BSS/EWCS',
      bondTransactions: {
        items: [
          {
            _id: '',
            type: 'Bond',
            dealId: '',
            createdDate: {
              $numberLong: '1653306251040'
            },
            updatedAt: {
              $numberLong: '1655212713525'
            },
            bondIssuer: ' Bank',
            bondType: 'Performance bond',
            facilityStage: 'Issued',
            ukefGuaranteeInMonths: '16',
            'requestedCoverStartDate-day': '14',
            'requestedCoverStartDate-month': '06',
            'requestedCoverStartDate-year': '2022',
            'coverEndDate-day': '12',
            'coverEndDate-month': '07',
            'coverEndDate-year': '2023',
            name: '',
            bondBeneficiary: '',
            requestedCoverStartDate: '1655212657295',
            hasBeenIssued: true,
            value: '90878.50',
            currencySameAsSupplyContractCurrency: 'true',
            currency: {
              text: 'EUR - Euros',
              id: 'EUR',
              currencyId: 11
            },
            conversionRate: null,
            'conversionRateDate-day': null,
            'conversionRateDate-month': null,
            'conversionRateDate-year': null,
            riskMarginFee: '2.45',
            coveredPercentage: '80',
            minimumRiskMarginFee: '',
            guaranteeFeePayableByBank: '2.2050',
            ukefExposure: '72,702.80',
            feeFrequency: 'Quarterly',
            feeType: 'In advance',
            dayCountBasis: '365',
            ukefFacilityId: '0020016023',
            'issuedDate-day': '14',
            'issuedDate-month': '06',
            'issuedDate-year': '2022',
            status: 'Acknowledged',
            issueFacilityDetailsStarted: true,
            nameRequiredForIssuance: true,
            issuedDate: '1655212657295',
            issueFacilityDetailsProvided: true,
            previousFacilityStage: 'Issued',
            issueFacilityDetailsSubmitted: true,
            submittedAsIssuedDate: {
              $numberLong: '1655212707052'
            },
            submittedAsIssuedBy: {
              username: '',
              roles: [
                'checker'
              ],
              bank: {
                id: '',
                name: '',
                emails: [
                  ''
                ],
                companiesHouseNo: '',
                partyUrn: ''
              },
              lastLogin: '',
              firstname: '',
              surname: '',
              email: '',
              timezone: 'Europe/London',
              'user-status': 'active',
              _id: ''
            },
            previousStatus: 'Submitted',
            hasBeenAcknowledged: true,
            hasBeenIssuedAndAcknowledged: true
          }
        ]
      },
      loanTransactions: {
        items: []
      },
      bankInternalRefName: '',
      additionalRefName: '',
      bank: {
        _id: '',
        id: '',
        name: '',
        mga: [
          ''
        ],
        emails: [
          ''
        ],
        companiesHouseNo: '',
        partyUrn: ''
      },
      maker: {
        username: '',
        roles: [
          'maker'
        ],
        bank: {
          _id: '',
          id: '',
          name: '',
          mga: [
            ''
          ],
          emails: [
            ''
          ],
          companiesHouseNo: '',
          partyUrn: ''
        },
        lastLogin: '1653304033669',
        firstname: '',
        surname: '',
        email: '',
        timezone: 'Europe/London',
        'user-status': 'active',
        _id: ''
      },
      updatedAt: {
        $numberLong: '1655212713609'
      },
      submissionType: 'Manual Inclusion Notice',
      facilitiesUpdated: {
        $numberLong: '1655212713577'
      },
      previousStatus: 'Acknowledged'
    },
    tfm: {
      dateReceived: '30-05-2022',
      dateReceivedTimestamp: 1653903045,
      parties: {
        exporter: {
          partyUrn: '',
          partyUrnRequired: true
        },
        buyer: {
          partyUrn: '',
          partyUrnRequired: true
        },
        indemnifier: {
          partyUrn: '',
          partyUrnRequired: false
        },
        agent: {
          partyUrn: '',
          partyUrnRequired: false,
          commissionRate: ''
        }
      },
      activities: [],
      product: 'BSS',
      lossGivenDefault: 50,
      exporterCreditRating: 'Acceptable (B+)',
      probabilityOfDefault: 14.1,
      lastUpdated: {
        $numberLong: '1658402500942'
      },
      stage: 'Confirmed',
      supplyContractValueInGBP: 0,
      estore: {
        siteName: ''
      },
      tasks: [],
      acbs: {
        portalDealId: '',
        ukefDealId: '',
        deal: {
          parties: {
          },
          deal: {
          },
          investor: {
          },
          guarantee: {
          }
        },
        facilities: [
          {
            facilityId: '',
            facilityStage: '',
            facilityMaster: {
            },
            facilityInvestor: {
            },
            facilityCovenant: {
            },
            parties: {
              bondIssuer: {
              },
              bondBeneficiary: {
              }
            },
            facilityCovenantChargeable: {
            },
            facilityBondIssuerGuarantee: {
            },
            facilityBondBeneficiaryGuarantee: {
            },
            codeValueTransaction: {
            },
            facilityLoan: {},
            facilityFee: [
            ]
          }
        ],
        dataMigration: true
      }
    }
  }
};

const facility = {
  _id: {
    $oid: ''
  },
  facilitySnapshot: {
    _id: {
      $oid: ''
    },
    type: 'Bond',
    dealId: {
      $oid: ''
    },
    createdDate: '',
    updatedAt: '',
    bondIssuer: '',
    bondType: '',
    ukefGuaranteeInMonths: null,
    facilityStage: 'Issued',
    'requestedCoverStartDate-day': 30,
    'requestedCoverStartDate-month': 12,
    'requestedCoverStartDate-year': 2022,
    'coverEndDate-day': '12',
    'coverEndDate-month': '12',
    'coverEndDate-year': '2024',
    name: '',
    bondBeneficiary: '',
    hasBeenIssued: false,
    requestedCoverStartDate: 0,
    coverEndDate: '',
    value: '0.00',
    currencySameAsSupplyContractCurrency: 'true',
    currency: {
      text: 'GBP - UK Sterling',
      id: 'GBP',
      currencyId: 12
    },
    conversionRate: null,
    'conversionRateDate-day': null,
    'conversionRateDate-month': null,
    'conversionRateDate-year': null,
    riskMarginFee: '0.0',
    coveredPercentage: '0',
    minimumRiskMarginFee: '',
    guaranteeFeePayableByBank: '0.0',
    ukefExposure: '0.00',
    feeFrequency: null,
    feeType: 'At maturity',
    dayCountBasis: '365',
    issueFacilityDetailsSubmitted: false,
    submittedAsIssuedDate: 0,
    submittedAsIssuedBy: {
      username: '',
      roles: [
        'checker'
      ],
      bank: {
        id: '',
        name: '',
        mga: [],
        emails: [],
        companiesHouseNo: '',
        partyUrn: ''
      },
      lastLogin: '',
      firstname: '',
      surname: '',
      email: '',
      timezone: 'Europe/London',
      'user-status': 'nonactive',
      _id: ''
    },
    status: '',
    ukefFacilityId: '',
    previousStatus: '',
    hasBeenIssuedAndAcknowledged: false,
    hasBeenAcknowledged: false
  },
  tfm: {
    premiumSchedule: [],
    ukefExposure: 0,
    ukefExposureCalculationTimestamp: '',
    exposurePeriodInMonths: 0,
    facilityGuaranteeDates: {
      guaranteeCommencementDate: '2022-12-30',
      guaranteeExpiryDate: '2024-12-12',
      effectiveDate: '2022-12-30'
    },
    riskProfile: 'Flat'
  }
};

module.exports = {
  deal,
  facility
};

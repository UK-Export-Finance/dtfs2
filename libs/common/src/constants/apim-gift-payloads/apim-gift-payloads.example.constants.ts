export const APIM_GIFT_PAYLOADS_EXAMPLES = {
  CREATE_FACILITY: {
    VALID_PAYLOAD: {
      consumer: 'DTFS',
      overview: {
        amount: 10000,
        creditType: 'Term',
        currency: 'USD',
        effectiveDate: '2025-01-01',
        facilityId: '000000001',
        expiryDate: '2027-02-01',
        name: 'Amazing facility',
        obligorUrn: '00325165',
        productTypeCode: 'PRT003',
        repaymentType: 'Bullet',
      },
      accrualSchedules: [
        {
          accrualDayBasisCode: 'ACTUAL_365',
          accrualEffectiveDate: '2025-01-13',
          accrualFrequencyCode: 'FREQ12MON',
          accrualMaturityDate: '2025-01-15',
          accrualScheduleTypeCode: 'PAC01',
          additionalRate: 0,
          baseRate: 0,
          firstCycleAccrualEndDate: '2025-01-15',
          indexRateCode: 'USD003',
          spreadRate: 0,
        },
      ],
      counterparties: [
        {
          counterpartyUrn: '00327833',
          exitDate: '2025-01-16',
          roleCode: 'CRT004',
          startDate: '2025-01-13',
        },
      ],
      fixedFees: [
        {
          amount: 5000,
          currency: 'USD',
          effectiveDate: '2025-01-15',
          feeTypeCode: 'PLA',
        },
      ],
      obligations: [
        {
          amount: 2500,
          currency: 'USD',
          effectiveDate: '2025-01-13',
          maturityDate: '2025-01-15',
          repaymentType: 'Bullet',
          subtypeCode: 'OST012',
        },
      ],
      riskDetails: {
        account: '2',
        dealId: '0030000123',
        facilityCreditRating: 'AA',
        riskStatus: 'Corporate',
        ukefIndustryCode: '0101',
      },
      delayCreation: true,
    },
  },
  AMEND_FACILITY: {
    MULTIPLE_AMENDMENTS: {
      amendments: [
        {
          amendmentType: 'IncreaseAmount',
          amendmentData: {
            amount: 800000,
            date: '2026-09-22',
          },
        },
        {
          amendmentType: 'ReplaceExpiryDate',
          amendmentData: {
            expiryDate: '2027-01-01',
          },
        },
      ],
    },
    DECREASE_AMOUNT: {
      messageType: 'FACILITY_AMENDMENT',
      facilityId: '0041745204',
      payload: {
        amendmentType: 'DecreaseAmount',
        amendmentData: {
          amount: 80000,
          date: '2026-09-22',
        },
      },
    },
    INCREASE_AMOUNT: {
      messageType: 'FACILITY_AMENDMENT',
      facilityId: '0041745204',
      payload: {
        amendmentType: 'IncreaseAmount',
        amendmentData: {
          amount: 80000,
          date: '2026-09-22',
        },
      },
    },
    REPLACE_EXPIRY_DATE: {
      messageType: 'FACILITY_AMENDMENT',
      facilityId: '0041745204',
      payload: {
        amendmentType: 'ReplaceExpiryDate',
        amendmentData: {
          expiryDate: '2027-01-01',
        },
      },
    },
  },
};

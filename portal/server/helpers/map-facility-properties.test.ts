import { FacilityDashboard, BSS_EWCS_FACILITY_TYPE, GEF_FACILITY_TYPE, FACILITY_STAGE, CURRENCY, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { cloneDeep } from 'lodash';
import { mapFacilityProperties } from './map-facility-properties';

const mockFacilities: FacilityDashboard[] = [
  {
    _id: '67a9e986dd0c179cf70141da',
    dealId: '67a9e95add0c179cf70141d8',
    name: 'ABC',
    currency: null,
    value: '1000.00',
    type: BSS_EWCS_FACILITY_TYPE.LOAN,
    hasBeenIssued: true,
    updatedAt: 1739188642683,
    lowerExporter: '',
  },
  {
    _id: '67a9e95cdd0c179cf70141d9',
    dealId: '67a9e95add0c179cf70141d8',
    name: null,
    currency: null,
    value: '1000.00',
    type: BSS_EWCS_FACILITY_TYPE.BOND,
    hasBeenIssued: false,
    updatedAt: 1739188612379,
    lowerExporter: '',
  },
  {
    _id: '67a5ed9c674f4ad7a17e3359',
    dealId: '67a5ed89674f4ad7a17e3358',
    submissionType: DEAL_SUBMISSION_TYPE.AIN,
    name: 'ABC',
    ukefFacilityId: '0020027639',
    currency: {
      id: CURRENCY.GBP,
    },
    value: 1000,
    type: GEF_FACILITY_TYPE.CASH,
    hasBeenIssued: true,
    submittedAsIssuedDate: '1738937285806',
    updatedAt: 1738937285814,
    exporter: 'TEST LTD',
    lowerExporter: 'test ltd',
    facilityStage: FACILITY_STAGE.RISK_EXPIRED,
  },
];

describe('mapFacilityProperties', () => {
  describe('mapFacilityStage', () => {
    it('should return correct facility stages', () => {
      // Act
      const result = mapFacilityProperties(mockFacilities);

      // Assert
      expect(result[0].facilityStage).toBe(FACILITY_STAGE.ISSUED);
      expect(result[1].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[2].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
    });

    it(`should return ${FACILITY_STAGE.RISK_EXPIRED} for all facilities`, () => {
      // Arrange
      const riskExpiredFacilities = cloneDeep(mockFacilities);

      riskExpiredFacilities[0].facilityStage = FACILITY_STAGE.RISK_EXPIRED;
      riskExpiredFacilities[1].facilityStage = FACILITY_STAGE.RISK_EXPIRED;
      riskExpiredFacilities[2].facilityStage = FACILITY_STAGE.RISK_EXPIRED;

      // Act
      const result = mapFacilityProperties(riskExpiredFacilities);

      // Assert
      expect(result[0].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
      expect(result[1].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
      expect(result[2].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
    });

    it('should return correct facility stages', () => {
      // Arrange
      const noFacilityStageFacilities = cloneDeep(mockFacilities);

      delete noFacilityStageFacilities[0].facilityStage;
      delete noFacilityStageFacilities[1].facilityStage;
      delete noFacilityStageFacilities[2].facilityStage;

      // Act
      const result = mapFacilityProperties(noFacilityStageFacilities);

      // Assert
      expect(result[0].facilityStage).toBe(FACILITY_STAGE.ISSUED);
      expect(result[1].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[2].facilityStage).toBe(FACILITY_STAGE.ISSUED);
    });

    it(`should return ${FACILITY_STAGE.UNISSUED} for all facilities with no facility stage and hasBeenIssued to false`, () => {
      // Arrange
      const noFacilityStageFacilities = cloneDeep(mockFacilities);

      delete noFacilityStageFacilities[0].facilityStage;
      noFacilityStageFacilities[0].hasBeenIssued = false;

      delete noFacilityStageFacilities[1].facilityStage;
      noFacilityStageFacilities[1].hasBeenIssued = false;

      delete noFacilityStageFacilities[2].facilityStage;
      noFacilityStageFacilities[2].hasBeenIssued = false;

      // Act
      const result = mapFacilityProperties(noFacilityStageFacilities);

      // Assert
      expect(result[0].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[1].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[2].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
    });
  });
});

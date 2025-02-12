import { FacilityDashboard, BSS_EWCS_FACILITY_TYPE, FACILITY_STAGE, CURRENCY, GEF_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapFacilityProperties } from './map-facility-properties';

const mockDashboardFacility = (properties?: Partial<FacilityDashboard>): FacilityDashboard => {
  return {
    _id: '67a9e986dd0c179cf70141da',
    dealId: '67a9e95add0c179cf70141d8',
    name: 'ABC',
    value: '1000.00',
    currency: {
      id: CURRENCY.GBP,
    },
    updatedAt: 1739188642683,
    lowerExporter: '',
    type: BSS_EWCS_FACILITY_TYPE.BOND,
    hasBeenIssued: false,
    ...properties,
  };
};

describe('mapFacilityProperties', () => {
  describe('mapFacilityStage', () => {
    it('should return correct facility stages for facility type bond (BSS/EWCS)', () => {
      // Arrange
      const bondUnissued = mockDashboardFacility();
      const bondIssued = mockDashboardFacility({ hasBeenIssued: true });
      const bondIssuedRiskExpired = mockDashboardFacility({ hasBeenIssued: true, facilityStage: FACILITY_STAGE.RISK_EXPIRED });
      const bondUnissuedRiskExpired = mockDashboardFacility({ facilityStage: FACILITY_STAGE.RISK_EXPIRED });
      const bondUnissuedFacilityStage = mockDashboardFacility({ hasBeenIssued: false, facilityStage: FACILITY_STAGE.UNISSUED });
      const bondIssuedFacilityStage = mockDashboardFacility({ hasBeenIssued: true, facilityStage: FACILITY_STAGE.ISSUED });

      const mockDashboardFacilities = [
        bondUnissued,
        bondIssued,
        bondIssuedRiskExpired,
        bondUnissuedRiskExpired,
        bondUnissuedFacilityStage,
        bondIssuedFacilityStage,
      ];

      // Act
      const result = mapFacilityProperties(mockDashboardFacilities);

      // Assert
      expect(result[0].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[1].facilityStage).toBe(FACILITY_STAGE.ISSUED);
      expect(result[2].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
      expect(result[3].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
      expect(result[4].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[5].facilityStage).toBe(FACILITY_STAGE.ISSUED);
    });

    it('should return correct facility stages for facility type loan (BSS/EWCS)', () => {
      // Arrange
      const loanUnissued = mockDashboardFacility({ type: BSS_EWCS_FACILITY_TYPE.LOAN });
      const loanIssued = mockDashboardFacility({ type: BSS_EWCS_FACILITY_TYPE.LOAN, hasBeenIssued: true });
      const loanIssuedRiskExpired = mockDashboardFacility({
        type: BSS_EWCS_FACILITY_TYPE.LOAN,
        hasBeenIssued: true,
        facilityStage: FACILITY_STAGE.RISK_EXPIRED,
      });
      const loanUnissuedRiskExpired = mockDashboardFacility({ type: BSS_EWCS_FACILITY_TYPE.LOAN, facilityStage: FACILITY_STAGE.RISK_EXPIRED });
      const loanUnconditionalFacilityStage = mockDashboardFacility({
        type: BSS_EWCS_FACILITY_TYPE.LOAN,
        hasBeenIssued: true,
        facilityStage: FACILITY_STAGE.UNCONDITIONAL,
      });
      const loanConditionalFacilityStage = mockDashboardFacility({ type: BSS_EWCS_FACILITY_TYPE.LOAN, facilityStage: FACILITY_STAGE.CONDITIONAL });

      const mockDashboardFacilities = [
        loanUnissued,
        loanIssued,
        loanIssuedRiskExpired,
        loanUnissuedRiskExpired,
        loanUnconditionalFacilityStage,
        loanConditionalFacilityStage,
      ];

      // Act
      const result = mapFacilityProperties(mockDashboardFacilities);

      // Assert
      expect(result[0].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[1].facilityStage).toBe(FACILITY_STAGE.ISSUED);
      expect(result[2].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
      expect(result[3].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
      expect(result[4].facilityStage).toBe(FACILITY_STAGE.ISSUED);
      expect(result[5].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
    });

    it('should return correct facility stages for facility type cash (GEF)', () => {
      // Arrange
      const cashUnissued = mockDashboardFacility({ type: GEF_FACILITY_TYPE.CASH });
      const cashIssued = mockDashboardFacility({ type: GEF_FACILITY_TYPE.CASH, hasBeenIssued: true });
      const cashIssuedRiskExpired = mockDashboardFacility({
        type: GEF_FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        facilityStage: FACILITY_STAGE.RISK_EXPIRED,
      });
      const cashUnissuedRiskExpired = mockDashboardFacility({ type: GEF_FACILITY_TYPE.CASH, facilityStage: FACILITY_STAGE.RISK_EXPIRED });

      const mockDashboardFacilities = [cashUnissued, cashIssued, cashIssuedRiskExpired, cashUnissuedRiskExpired];

      // Act
      const result = mapFacilityProperties(mockDashboardFacilities);

      // Assert
      expect(result[0].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[1].facilityStage).toBe(FACILITY_STAGE.ISSUED);
      expect(result[2].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
      expect(result[3].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
    });

    it('should return correct facility stages for facility type contingent (GEF)', () => {
      // Arrange
      const contingentUnissued = mockDashboardFacility({ type: GEF_FACILITY_TYPE.CONTINGENT });
      const contingentIssued = mockDashboardFacility({ type: GEF_FACILITY_TYPE.CONTINGENT, hasBeenIssued: true });
      const contingentIssuedRiskExpired = mockDashboardFacility({
        type: GEF_FACILITY_TYPE.CONTINGENT,
        hasBeenIssued: true,
        facilityStage: FACILITY_STAGE.RISK_EXPIRED,
      });
      const contingentUnissuedRiskExpired = mockDashboardFacility({ type: GEF_FACILITY_TYPE.CONTINGENT, facilityStage: FACILITY_STAGE.RISK_EXPIRED });

      const mockDashboardFacilities = [contingentUnissued, contingentIssued, contingentIssuedRiskExpired, contingentUnissuedRiskExpired];

      // Act
      const result = mapFacilityProperties(mockDashboardFacilities);

      // Assert
      expect(result[0].facilityStage).toBe(FACILITY_STAGE.UNISSUED);
      expect(result[1].facilityStage).toBe(FACILITY_STAGE.ISSUED);
      expect(result[2].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
      expect(result[3].facilityStage).toBe(FACILITY_STAGE.RISK_EXPIRED);
    });
  });
});

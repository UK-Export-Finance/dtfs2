import { AuditableBaseEntity } from './auditable.base-entity';
import { DbRequestSource } from '../helpers';

// We cannot create instances of abstract classes, so we define a test class below
class TestAuditableBaseEntity extends AuditableBaseEntity {}

describe('AuditableBaseEntity', () => {
  describe('updateLastUpdatedBy', () => {
    it("updates the portal audit details and resets the rest when the request source platform is 'PORTAL'", () => {
      // Arrange
      const testAuditableBaseEntity = new TestAuditableBaseEntity();
      const userId = 'abc123';

      // Act
      testAuditableBaseEntity.updateLastUpdatedBy({ platform: 'PORTAL', userId });

      // Assert
      expect(testAuditableBaseEntity).toEqual(
        expect.objectContaining<Partial<AuditableBaseEntity>>({
          lastUpdatedByPortalUserId: userId,
          lastUpdatedByTfmUserId: null,
          lastUpdatedByIsSystemUser: false,
        }),
      );
    });

    it("updates the tfm audit details and resets the rest when the request source platform is 'TFM'", () => {
      // Arrange
      const testAuditableBaseEntity = new TestAuditableBaseEntity();
      const userId = 'def456';

      // Act
      testAuditableBaseEntity.updateLastUpdatedBy({ platform: 'TFM', userId });

      // Assert
      expect(testAuditableBaseEntity).toEqual(
        expect.objectContaining<Partial<AuditableBaseEntity>>({
          lastUpdatedByPortalUserId: null,
          lastUpdatedByTfmUserId: userId,
          lastUpdatedByIsSystemUser: false,
        }),
      );
    });

    it("updates the system audit details and resets the rest when the request source platform is 'SYSTEM'", () => {
      // Arrange
      const testAuditableBaseEntity = new TestAuditableBaseEntity();

      // Act
      testAuditableBaseEntity.updateLastUpdatedBy({ platform: 'SYSTEM' });

      // Assert
      expect(testAuditableBaseEntity).toEqual(
        expect.objectContaining<Partial<AuditableBaseEntity>>({
          lastUpdatedByPortalUserId: null,
          lastUpdatedByTfmUserId: null,
          lastUpdatedByIsSystemUser: true,
        }),
      );
    });

    it('throws an error when the request source platform is invalid', () => {
      // Arrange
      const testAuditableBaseEntity = new TestAuditableBaseEntity();

      const invalidPlatform = 'Invalid';
      // @ts-expect-error the request source should be invalid for this test
      const invalidRequestSource: DbRequestSource = { platform: invalidPlatform };

      // Act/Assert
      expect(() => testAuditableBaseEntity.updateLastUpdatedBy(invalidRequestSource)).toThrow(
        new Error(`Request source platform '${invalidPlatform}' not recognised`),
      );
    });
  });
});

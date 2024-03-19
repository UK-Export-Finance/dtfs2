import { AuditableBaseEntity } from '.';
import { DbRequestSource } from '../helpers';

// We cannot create instances of abstract classes, so we define a test class below
class TestAuditableBaseEntity extends AuditableBaseEntity {}

describe('AuditableBaseEntity', () => {
  describe('updateActivityDetails', () => {
    describe("when the request source platform is 'PORTAL'", () => {
      const userId = 'abc123';

      it.each`
        field                          | value
        ${'lastUpdatedByIsSystemUser'} | ${false}
        ${'lastUpdatedByPortalUserId'} | ${userId}
        ${'lastUpdatedByTfmUserId'}    | ${null}
      `("sets '$field' to '$value'", ({ field, value }: { field: keyof AuditableBaseEntity; value: boolean | string | null }) => {
        // Arrange
        const testAuditableBaseEntity = new TestAuditableBaseEntity();

        // Act
        testAuditableBaseEntity.updateActivityDetails({ platform: 'PORTAL', userId });

        // Assert
        expect(testAuditableBaseEntity[field]).toBe(value);
      });
    });

    describe("when the request source platform is 'TFM'", () => {
      const userId = 'abc123';

      it.each`
        field                          | value
        ${'lastUpdatedByIsSystemUser'} | ${false}
        ${'lastUpdatedByPortalUserId'} | ${null}
        ${'lastUpdatedByTfmUserId'}    | ${userId}
      `("sets '$field' to '$value'", ({ field, value }: { field: keyof AuditableBaseEntity; value: boolean | string | null }) => {
        // Arrange
        const testAuditableBaseEntity = new TestAuditableBaseEntity();

        // Act
        testAuditableBaseEntity.updateActivityDetails({ platform: 'TFM', userId });

        // Assert
        expect(testAuditableBaseEntity[field]).toBe(value);
      });
    });

    describe("when the request source platform is 'SYSTEM'", () => {
      it.each`
        field                          | value
        ${'lastUpdatedByIsSystemUser'} | ${true}
        ${'lastUpdatedByPortalUserId'} | ${null}
        ${'lastUpdatedByTfmUserId'}    | ${null}
      `("sets '$field' to '$value'", ({ field, value }: { field: keyof AuditableBaseEntity; value: boolean | string | null }) => {
        // Arrange
        const testAuditableBaseEntity = new TestAuditableBaseEntity();

        // Act
        testAuditableBaseEntity.updateActivityDetails({ platform: 'SYSTEM' });

        // Assert
        expect(testAuditableBaseEntity[field]).toBe(value);
      });
    });

    it('throws an error when the request source platform is invalid', () => {
      // Arrange
      const testAuditableBaseEntity = new TestAuditableBaseEntity();

      // @ts-expect-error the request source should be invalid for this test
      const invalidRequestSource: DbRequestSource = { platform: 'Invalid' };

      // Act/Assert
      expect(() => testAuditableBaseEntity.updateActivityDetails(invalidRequestSource)).toThrow(
        new Error('Request source platform did not match any expected request source'),
      );
    });
  });
});

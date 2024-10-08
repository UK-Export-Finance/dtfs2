import { ObjectId } from 'mongodb';
import { AUDIT_USER_TYPES_NOT_REQUIRING_ID, AUDIT_USER_TYPES_REQUIRING_ID } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './audit-details.schema';

describe('audit-details.schema', () => {
  describe('AuditDetailsSchema', () => {
    describe.each(Object.values(AUDIT_USER_TYPES_NOT_REQUIRING_ID))("when the 'userType' is %s", (userType) => {
      it("sets the 'success' property to true when the auditDetails object is valid", () => {
        // Arrange
        const auditDetails = { userType };

        // Act
        const { success } = AuditDetailsSchema.safeParse(auditDetails);

        // Assert
        expect(success).toBe(true);
      });

      it("sets the 'data' property to the parsed auditDetails when the auditDetails object is valid", () => {
        // Arrange
        const auditDetails = { userType };

        // Act
        const { data } = AuditDetailsSchema.safeParse(auditDetails);

        // Assert
        expect(data).toEqual(auditDetails);
      });

      it("sets the 'success' property to false when the auditDetails object is invalid", () => {
        // Arrange
        const auditDetails = { userType: 'invalid-type' };

        // Act
        const { success } = AuditDetailsSchema.safeParse(auditDetails);

        // Assert
        expect(success).toBe(false);
      });
    });

    describe.each(Object.values(AUDIT_USER_TYPES_REQUIRING_ID))("when the 'userType' is %s", (userType) => {
      const aValidObjectId = () => new ObjectId();

      it("sets the 'success' property to true when the auditDetails object is valid", () => {
        // Arrange
        const auditDetails = { userType, id: aValidObjectId() };

        // Act
        const { success } = AuditDetailsSchema.safeParse(auditDetails);

        // Assert
        expect(success).toBe(true);
      });

      it("sets the 'data' property to the parsed auditDetails when the auditDetails object is valid", () => {
        // Arrange
        const auditDetails = { userType, id: aValidObjectId() };

        // Act
        const { data } = AuditDetailsSchema.safeParse(auditDetails);

        // Assert
        expect(data).toEqual({
          userType,
          id: auditDetails.id.toString(),
        });
      });

      it("sets the 'success' property to false when the auditDetails 'userType' is invalid", () => {
        // Arrange
        const auditDetails = { userType: 'invalid-type', id: aValidObjectId() };

        // Act
        const { success } = AuditDetailsSchema.safeParse(auditDetails);

        // Assert
        expect(success).toBe(false);
      });

      it("sets the 'success' property to false when the auditDetails 'id' is invalid", () => {
        // Arrange
        const auditDetails = { userType, id: 'abc123' };

        // Act
        const { success } = AuditDetailsSchema.safeParse(auditDetails);

        // Assert
        expect(success).toBe(false);
      });
    });
  });
});

import { AMENDMENT_STATUS, AmendmentStatus } from '@ukef/dtfs2-common';
import { AmendmentStatusSchema } from './amendment-status.schema';

describe('amendment-status.schema', () => {
  describe('AmendmentStatusSchema', () => {
    it.each(Object.values(AMENDMENT_STATUS))("sets the 'success' property to true when the amendment status is '%s'", (status) => {
      // Act
      const { success } = AmendmentStatusSchema.safeParse(status);

      // Assert
      expect(success).toBe(true);
    });

    it("sets the 'success' property to false when the amendment status is invalid", () => {
      // Arrange
      const invalidStatus = 'An invalid amendment status';

      // Act
      const { success } = AmendmentStatusSchema.safeParse(invalidStatus);

      // Assert
      expect(success).toBe(false);
    });

    it("sets the 'data' property to the parsed amendment status", () => {
      // Arrange
      const status: AmendmentStatus = 'Completed';

      // Act
      const { data } = AmendmentStatusSchema.safeParse(status);

      // Assert
      expect(data).toBe(status);
    });
  });
});

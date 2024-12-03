import { dateFromIsoStringSchema } from './dateFromIsoString.schema';

describe('dateFromIsoString.schema', () => {
  describe('dateFromIsoStringSchema', () => {
    it("sets the 'success' property to true when the ISO string is valid", () => {
      // Arrange
      const validIsoString = new Date('2022-03-5').toISOString();

      // Act
      const { success } = dateFromIsoStringSchema.safeParse(validIsoString);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the ISO string is invalid", () => {
      // Arrange
      const invalidIsoString = '2022-03-5';

      // Act
      const { success } = dateFromIsoStringSchema.safeParse(invalidIsoString);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'data' property to the parsed date", () => {
      // Arrange
      const validIsoString = new Date('2022-03-5').toISOString();

      // Act
      const { data } = dateFromIsoStringSchema.safeParse(validIsoString);

      // Assert
      expect(data).toEqual(new Date('2022-03-5'));
    });
  });
});

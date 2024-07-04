import { ObjectId } from 'mongodb';
import { MongoObjectIdSchema } from './mongo-object-id.schema';

describe('mongo-object-id.schema', () => {
  describe('MongoObjectIdSchema', () => {
    it("sets the 'success' property to true when the value is a valid object id string", () => {
      // Arrange
      const validObjectId = new ObjectId().toString();

      // Act
      const { success } = MongoObjectIdSchema.safeParse(validObjectId);

      // Assert
      expect(success).toBe(true);
    });

    it("sets the 'success' property to true when the value is a valid object id object", () => {
      // Arrange
      const validObjectId = new ObjectId();

      // Act
      const { success } = MongoObjectIdSchema.safeParse(validObjectId);

      // Assert
      expect(success).toBe(true);
    });

    it("sets the 'success' property to false when the value is not a valid object id", () => {
      // Arrange
      const invalidObjectId = '';

      // Act
      const { success } = MongoObjectIdSchema.safeParse(invalidObjectId);

      // Assert
      expect(success).toBe(false);
    });

    it("sets the 'data' property to the string representation of the object id", () => {
      // Arrange
      const objectId = new ObjectId();

      // Act
      const { data } = MongoObjectIdSchema.safeParse(objectId);

      // Assert
      expect(data).toBe(objectId.toString());
    });
  });
});

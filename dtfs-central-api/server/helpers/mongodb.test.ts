import { ObjectId } from 'mongodb';
import { withoutMongoId } from './mongodb';

describe('mongodb helper', () => {
  describe('withoutMongoId', () => {
    it("returns the passed object without the '_id' property", () => {
      // Arrange
      const document = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        otherProperty: 'test',
      };

      // Act
      const result = withoutMongoId(document);

      // Assert
      expect(result).toEqual({ otherProperty: document.otherProperty });
    });
  });
});

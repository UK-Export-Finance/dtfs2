import { ObjectId } from 'mongodb';
import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-object-tests/with-default-options.tests';

export const withObjectIdStringSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedField,
}: WithSchemaTestParams<Schema>) => {
  describe('with OBJECT_ID_STRING_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedField,
    });
    it('should fail parsing if the parameter is not an ObjectId', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField('string'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid string representation of an ObjectId', () => {
      const stringObjectId = new ObjectId().toString();

      const { success } = schema.safeParse(getTestObjectWithUpdatedField(stringObjectId));

      expect(success).toBe(true);
    });

    it('should not transform a valid string ObjectId to an ObjectId', () => {
      const stringObjectId = new ObjectId().toString();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = schema.safeParse(getTestObjectWithUpdatedField(stringObjectId));

      expect(data).toEqual(getTestObjectWithUpdatedField(stringObjectId));
    });

    it('should transform a valid ObjectId to a string', () => {
      const objectId = new ObjectId();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = schema.safeParse(getTestObjectWithUpdatedField(objectId));

      expect(data).toEqual(getTestObjectWithUpdatedField(objectId.toString()));
    });
  });
};

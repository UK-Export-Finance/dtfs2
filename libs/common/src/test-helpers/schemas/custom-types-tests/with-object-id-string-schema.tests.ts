import { ObjectId } from 'mongodb';
import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '@ukef/test-helpers/schemas/types/with-schema-test.type';
import { withDefaultOptionsTests } from '@ukef/test-helpers/schemas/primitive-types-tests';

export const withObjectIdStringSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with OBJECT_ID_STRING_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    it('should fail parsing if the parameter is not an ObjectId', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('string'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid string representation of an ObjectId', () => {
      const stringObjectId = new ObjectId().toString();

      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(stringObjectId));

      expect(success).toBe(true);
    });

    it('should not transform a valid string ObjectId to an ObjectId', () => {
      const stringObjectId = new ObjectId().toString();

      const { data } = schema.safeParse(getTestObjectWithUpdatedParameter(stringObjectId));

      expect(data).toEqual(getTestObjectWithUpdatedParameter(stringObjectId));
    });

    it('should transform a valid ObjectId to a string', () => {
      const objectId = new ObjectId();

      const { data } = schema.safeParse(getTestObjectWithUpdatedParameter(objectId));

      expect(data).toEqual(getTestObjectWithUpdatedParameter(objectId.toString()));
    });
  });
};

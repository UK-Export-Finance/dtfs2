import { ZodSchema } from 'zod';
import { ObjectId } from 'mongodb';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-types-tests';

export const withObjectIdOrObjectIdStringSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA tests', () => {
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

    it('should pass parsing if the parameter is an ObjectId', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(new ObjectId()));
      expect(success).toBe(true);
    });

    it('should pass parsing if the parameter is a string representation of an ObjectId', () => {
      const stringObjectId = new ObjectId().toString();

      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(stringObjectId));

      expect(success).toBe(true);
    });
  });
};

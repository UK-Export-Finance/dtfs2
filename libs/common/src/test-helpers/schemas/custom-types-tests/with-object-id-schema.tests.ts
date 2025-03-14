import { ObjectId } from 'mongodb';
import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-types-tests';

export const withObjectIdSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with OBJECT_ID_SCHEMA tests', () => {
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

    it('should not transform a valid ObjectId to a string', () => {
      const objectId = new ObjectId();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = schema.safeParse(getTestObjectWithUpdatedParameter(objectId));

      expect(data).toEqual(getTestObjectWithUpdatedParameter(objectId));
    });

    it('should transform a valid string ObjectId to an ObjectId', () => {
      const stringObjectId = new ObjectId().toString();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = schema.safeParse(getTestObjectWithUpdatedParameter(stringObjectId));

      expect(data).toEqual(getTestObjectWithUpdatedParameter(new ObjectId(stringObjectId)));
    });
  });
};

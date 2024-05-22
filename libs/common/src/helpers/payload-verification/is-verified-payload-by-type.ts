import { IsVerifiedPayloadByTypeParams } from '../../types/payload-verification';

/**
 * @deprecated prefer IsVerifiedPayloadByZod
 */
export const isVerifiedPayloadByType = ({ payload, template }: IsVerifiedPayloadByTypeParams) => {
  if (!payload || !template || !Object.keys(payload).length || !Object.keys(template).length) {
    return false;
  }

  // 1. Properties key validation
  const payloadKeys = Object.keys(payload);
  const templateKeys = Object.keys(template);

  const isEveryTemplateFieldOnPayload = templateKeys.every((propertyKey) => payloadKeys.includes(propertyKey));

  // 2. Ensure no additional properties
  const isNoAdditionalFieldsOnPayload = !payloadKeys.filter((propertyKey) => !templateKeys.includes(propertyKey)).length;

  // 3. Properties data type validation
  // Note: This treats null as an object, which is required for the existing validation to work
  // We should look to migrate away from this form of validation and use zod schemas
  const isMatchingTypesWithTemplate = payloadKeys.every((key) => {
    const payloadKeyDataType = typeof payload[key];
    const templateKeyDataType = template[key];

    return payloadKeyDataType.toLowerCase() === templateKeyDataType?.toLowerCase();
  });
  // Compound comparison condition
  return isEveryTemplateFieldOnPayload && isNoAdditionalFieldsOnPayload && isMatchingTypesWithTemplate;
};

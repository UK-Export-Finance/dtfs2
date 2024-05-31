import { IsVerifiedPayloadByTypeParams } from '../../types/payload-verification';

/**
 * @deprecated prefer IsVerifiedPayloadByZod
 */
export const isVerifiedPayloadByType = ({ payload, template }: IsVerifiedPayloadByTypeParams) => {
  if (!payload || !template || !Object.keys(payload).length || !Object.keys(template).length) {
    console.error('Payload verification error - no data');
    return false;
  }

  const payloadKeys = Object.keys(payload);
  const templateKeys = Object.keys(template);

  // 1. Properties key validation
  const missingProperties = templateKeys.filter((x) => !payloadKeys.includes(x));

  // 2. Ensure no additional properties
  const extraProperties = payloadKeys.filter((x) => !templateKeys.includes(x));

  // 3. Properties data type validation
  const propertiesDataTypeMatch = payloadKeys.every((key) => {
    const payloadKeyDataType = typeof payload[key];
    const templateKeyDataType = template[key];
    const keysHaveMatchingTypes = payloadKeyDataType.toLowerCase() === templateKeyDataType?.toLowerCase();

    if (!keysHaveMatchingTypes) {
      console.error(
        `Payload verification error - type mismatch for field "${key}": payload type "${payloadKeyDataType}", template type "${templateKeyDataType}"`,
      );
    }

    return keysHaveMatchingTypes;
  });

  if (missingProperties.length) {
    console.error('Payload verification error - missing properties %s', missingProperties);
  }
  if (extraProperties.length) {
    console.error('Payload verification error - extra properties %s', extraProperties);
  }
  if (!propertiesDataTypeMatch) {
    console.error('Payload verification error - field type mismatch');
  }
  // Compound comparison condition
  return !missingProperties.length && !extraProperties.length && propertiesDataTypeMatch;
};

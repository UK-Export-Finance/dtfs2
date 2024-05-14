import { IsVerifiedPayloadbyTypeParams, TemplateByType } from '../../types/payload-verification';

export const isVerifiedPayloadByType = ({
  payload,
  template,
  areAllPropertiesRequired,
}: IsVerifiedPayloadbyTypeParams) => {
  if (!payload || !template || !Object.keys(payload).length || !Object.keys(template).length) {
    return false;
  }

  // 1. Properties key validation
  const payloadKeys = Object.keys(payload);
  const templateKeys = Object.keys(template);

  const doesEveryTemplatePropertyExistOnThePayload = templateKeys.every((propertyKey) => payloadKeys.includes(propertyKey));

  // 2. Ensure no additional properties
  const doesthePayloadHaveAnyAdditionalProperties = !payloadKeys.filter((propertyKey) => !templateKeys.includes(propertyKey)).length;

  // 3. Properties data type validation
  const doesTypesMatch = payloadKeys.every((key) => {
    const payloadKeyDataType = typeof payload[key];
    const templateKeyDataType = template[key];

    return payloadKeyDataType.toLowerCase() === templateKeyDataType?.toLowerCase();
  });

  // Compound comparison condition
  return doesEveryTemplatePropertyExistOnThePayload && doesthePayloadHaveAnyAdditionalProperties && doesTypesMatch;
};

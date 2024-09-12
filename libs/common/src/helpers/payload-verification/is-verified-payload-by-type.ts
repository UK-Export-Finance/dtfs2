import { IsVerifiedPayloadByTypeParams } from '../../types/payload-verification';
/**
 * @deprecated
 * @param {string[]} errorResult - List of errors
 * @returns {boolean} - Returns false if there are errors, otherwise true
 * @description - Logs the error list and returns false if there are errors, otherwise true
 */
const handleErrorListAndReturnResult = (errorResult: string[]) => {
  if (errorResult.length) {
    console.error('Payload verification error:\n%s', errorResult.join('\n'));
    return false;
  }
  return true;
};

/**
 * @deprecated prefer IsVerifiedPayloadByZod
 * @description This function is legacy code used to verify a payload by a template.
 * It is not recommended to use this function as it is not as rigorous as the Zod schema validation.
 * It has several odd behaviours, limitations, and is generally not as extendable as the replacement.
 */
export const isVerifiedPayloadByType = ({ payload, template }: IsVerifiedPayloadByTypeParams) => {
  if (!payload || !template || !Object.keys(payload).length || !Object.keys(template).length) {
    return handleErrorListAndReturnResult(['no data']);
  }

  const payloadKeys = Object.keys(payload);
  const templateKeys = Object.keys(template);

  const errorList: string[] = [];

  // 1. Properties key validation
  templateKeys.forEach((templateKey) => {
    if (!payloadKeys.includes(templateKey)) {
      errorList.push(`missing property: ${templateKey}`);
    }
  });

  payloadKeys.forEach((payloadKey) => {
    // 2. Ensure no additional properties
    if (!templateKeys.includes(payloadKey)) {
      errorList.push(`extra property: ${payloadKey}`);
      return;
    }

    // 3. Properties data type validation
    const payloadKeyDataType = typeof payload[payloadKey];
    const templateKeyDataType = template[payloadKey];
    const keysHaveMatchingTypes = payloadKeyDataType.toLowerCase() === templateKeyDataType?.toLowerCase();
    if (!keysHaveMatchingTypes) {
      errorList.push(`type mismatch: ${payloadKey} (expected ${templateKeyDataType}, got ${payloadKeyDataType})`);
    }
  });

  return handleErrorListAndReturnResult(errorList);
};

const emailDomainSeparator = '@';

const obscureEmail = (email) => {
  const trimmedEmail = email.trim();
  if (!email.includes(emailDomainSeparator)) {
    throw new Error(`Unable to obscure email: ${emailDomainSeparator} is not present in ${email}.`);
  }

  const [beforeAtSign, afterAtSign] = trimmedEmail.split('@');
  const firstCharacterBeforeAtSign = beforeAtSign[0];

  if (!firstCharacterBeforeAtSign) {
    throw new Error(`Unable to obscure email: there are no non-whitespace characters present before ${emailDomainSeparator} in ${email}.`);
  }
  const lastCharacterBeforeAtSign = beforeAtSign[beforeAtSign.length - 1];
  return `${firstCharacterBeforeAtSign}***${lastCharacterBeforeAtSign}@${afterAtSign}`;
};

module.exports = {
  obscureEmail,
};

const findMissingMandatory = (data, mandatoryFields) => mandatoryFields.map((mf) => (data[mf] !== null || data[mf] !== undefined || data[mf] !== '' ? '' : mf)).filter((mf) => mf !== '');

module.exports = {
  findMissingMandatory,
};

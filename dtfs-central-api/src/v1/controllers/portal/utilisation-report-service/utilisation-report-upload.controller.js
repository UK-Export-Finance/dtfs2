const db = require('../../../../drivers/db-client');

const getPaymentOfficerTeamDetails = async (req, res) => {
  const { bankId } = req.params;
  try {
    const bankCollection = await db.getCollection('banks');
    const filteredBank = await bankCollection.findOne({ id: bankId });
    res.status(200).send(filteredBank);
  } catch (error) {
    console.error('Unable to get utilisation reports %s', error);
  }
};

module.exports = {
  getPaymentOfficerTeamDetails,
};

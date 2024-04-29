const { deleteAllDurableFunctionLogs } = require('../../../services/repositories/durable-functions-repo');

exports.deleteAllDurableFunctions = async (req, res) => {
  try {
    await deleteAllDurableFunctionLogs();
    return res.status(200).send();
  } catch (error) {
    console.error('ACBS DOF error %o', error);

    return res.status(500).send({
      error: 'An exception has occurred',
    });
  }
};

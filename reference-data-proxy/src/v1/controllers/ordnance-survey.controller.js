const axios = require('axios');

const ordnanceSurveyBaseUrl = process.env.ORDNANCE_SURVEY_API_URL;
const ordnanceSurveyApiKey = process.env.ORDNANCE_SURVEY_API_KEY;

exports.lookup = async (req, res) => {
  const { postcode } = req.params;

  console.log('Calling Ordnance Survey API');

  const url = `${ordnanceSurveyBaseUrl}/search/places/v1/postcode?postcode=${postcode}&key=${ordnanceSurveyApiKey}`;

  const response = await axios({
    method: 'get',
    url,
  }).catch((catchErr) => {
    console.log('Error calling Ordnance Survey API');
    return catchErr.response;
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

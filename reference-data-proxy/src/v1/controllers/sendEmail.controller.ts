import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

export const sendEmail = async (templateId: string, sendToEmailAddress: string, emailVariables: object) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: `${referenceProxyUrl}/email`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        templateId,
        sendToEmailAddress,
        emailVariables,
      },
    });
    return data;
  } catch (err) {
    console.error(`Unable to send the email: ${err}`);
    return false;
  }
};

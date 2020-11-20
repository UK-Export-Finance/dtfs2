import axios from 'axios';
import FormData from 'form-data';
import apollo from './graphql/apollo';

import { dealQuery } from './graphql/queries';

require('dotenv').config();

const urlRoot = process.env.TRADE_FINANCE_MANAGER_API_URL;

const getDeal = async (id) => {
  console.log('GET DEAL ID ', id);
  const response = await apollo('GET', dealQuery, { id });

  return response.data.deal;
};

export default {
  getDeal
};

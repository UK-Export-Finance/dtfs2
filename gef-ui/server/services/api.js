import Axios from './axios'

export const validateToken = async function (token) {
  try {
    Axios.defaults.headers.common['Authorization'] = token
    const response = await Axios.get('/validate')
    return response.status === 200
  } catch (err) {
    return err.response
  }
}

export const getMandatoryCriteria = async function () {
  try {
    // const response = await Axios.get('/mandatory-criteria/latest')
    const response = { 
      data: {
        htmlText: '<p>Test</p>'
      }
    }
    return response.data
  } catch (err) {
    throw err
  }
}

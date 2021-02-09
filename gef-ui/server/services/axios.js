import axios from 'axios'

const V = 'v1'
const BASEURL = ''

export const auth = axios.create({
  baseURL: BASEURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export default {
  auth
}
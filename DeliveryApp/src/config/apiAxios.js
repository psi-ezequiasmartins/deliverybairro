/**
 * src/config/apiAxios.js
 */

import Axios from "axios";

const URL = process.env.REACT_APP_BASEURL;
// Debug para verificar se a variável de ambiente está sendo carregada
console.log('REACT_APP_BASEURL:', URL);
// Fallback caso a variável não esteja definida
const baseURL = URL || 'http://localhost:33570';
console.log('Using baseURL:', baseURL);
const api = Axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Accept": "*/*"
  }
});

export default api;

import axios from "axios";
import { API_URL } from "./configs";

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

// Add a request interceptor to dynamically add the Authorization header
instance.interceptors.request.use(
  (config) => {
    const authTokens = JSON.parse(localStorage.getItem("authTokens"));
    if (authTokens && authTokens.access) {
      config.headers.Authorization = `Bearer ${authTokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
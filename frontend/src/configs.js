const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1/";
// process.env.REACT_APP_API_URL || "https://api.tzuchitech.com/api/v1/";

const MEDIA_URL =
  process.env.REACT_APP_MEDIA_URL || "http://localhost:8000/media/";
// process.env.REACT_APP_MEDIA_URL || "https://api.tzuchitech.com/media/";

const EXPIRATION_TIME = 1000 * 60 * 60 * 6; // 6 hours from now

export { API_URL, EXPIRATION_TIME, MEDIA_URL }; 
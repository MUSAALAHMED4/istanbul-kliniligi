import { EXPIRATION_TIME } from "configs";

export function isUserAuthenticated() {
  const userInfo = localStorage.getItem("authTokens");
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  return null;
}

export function setAuthInfo(data) {
  const authInfo = localStorage.setItem("authTokens", JSON.stringify(data));
  const userType = localStorage.setItem("userType", data.user?.groups[0]?.name);
  const expirationTime = Date.now() + EXPIRATION_TIME;
  localStorage.setItem("expirationTime", expirationTime);

  return { authInfo, userType, expirationTime };
}

export function getAuthInfo() {
    const expirationTime = localStorage.getItem("expirationTime");
    const authTokens = JSON.parse(localStorage.getItem("authTokens"));
    console.log(authTokens, expirationTime);
  
    if (!authTokens || Date.now() > expirationTime) {
      // Token is missing or expired
      console.log("Token is expired or missing");
      return { expirationTime: null, authTokens: null };
    }
  
    console.log(authTokens, expirationTime);
    return { expirationTime, authTokens };
  }
  
export function removeAuthInfo() {
  localStorage.removeItem("authTokens");
  localStorage.removeItem("userType");
}
import {createContext, useState} from "react";
import {API_URL} from "../configs";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { set } from "lodash";
import { removeAuthInfo, setAuthInfo } from "../helpers/auth";

console.log(API_URL);

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    let [user, setUser] = useState(null);
    let [isLoading, setIsLoading] = useState(false);
    let [error, setError] = useState(null);
    let [loading, setLoading] = useState(true);
    let [userType, setUserType] = useState(null);
    const {loginUser, logoutUser} = useAuth();

    let [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem("authTokens")
        ? JSON.parse(localStorage.getItem("authTokens"))
        : null
    );

    const navigate = useNavigate();

    const login = async (e) => {
      setIsLoading(true);
  
      const response = await fetch(`${API_URL}token/`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              username: e.target.username.value,
              password: e.target.password.value,
          }),
      });
  
      const data = await response.json();
  
      if (response.status === 200) {
          const { authTokens, userType, expirationTime } = await setAuthInfo(data);
          setAuthTokens(authTokens); // set tokens in state
          setUser(data.user); // set user
          setUserType(userType); // set user type
          setIsLoading(false);
          navigate("/"); // redirect to home
      } else {
          console.log(data.detail);
          setIsLoading(false);
          setError(data.detail);
      }
  };

    let logout = () => {
      setUser(null);
      removeAuthInfo();
      navigate("/login");
    };

    let updateToken = async () => {
      let response = await fetch(
        `${API_URL}token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: authTokens?.refresh }),
        }
      );

      let data = await response.json();

      if (response.status === 200) {
        const newAuthTokens = { ...authTokens, access: data.access };
        setAuthTokens(newAuthTokens);
        localStorage.setItem("authTokens", JSON.stringify(newAuthTokens));
      } else {
        logout();
      }

      if (isLoading) {
        setIsLoading(false);
      }
    };  

    // useEffect(() => {
    //   if (isLoading) {
    //     updateToken();
    //   }
    // }, [authTokens, isLoading]);

    let contextData = {
        user,
        login,
        logout,
        isLoading,
        error,
        updateToken,
    };

    return (
        <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
    );
};

export default AuthContext;
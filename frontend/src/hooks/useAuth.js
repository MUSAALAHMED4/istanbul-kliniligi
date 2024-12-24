import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {API_URL, EXPIRATION_TIME} from "../configs";

function useAuth() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const tokens = localStorage.getItem("authTokens");
        if (tokens) {
            const username = JSON.parse(tokens).user?.username;
            const userType = localStorage.getItem("userType");
            const expirationTime = localStorage.getItem("expirationTime");

            if (Date.now() < expirationTime) {
                setCurrentUser({username, userType, expirationTime});
            } else {
                logoutUser(); // Log out if the token is expired
            }
        }
    }, []);

    function isLoggedIn() {
        return localStorage.getItem("authTokens") !== null;
    }

    function loginUser(data) {
        const expirationTime = Date.now() + EXPIRATION_TIME; // 6 hours from now
        localStorage.setItem("authTokens", JSON.stringify(data));
        localStorage.setItem("userType", data.user?.groups[0]?.name);
        localStorage.setItem("expirationTime", expirationTime);

        setCurrentUser({
            username: data.user?.username,
            userType: data.user?.groups[0]?.name,
            expirationTime: expirationTime,
        });

        navigate("/"); // Navigate after setting the state
    }

    function logoutUser() {
        localStorage.removeItem("authTokens");
        localStorage.removeItem("userType");
        localStorage.removeItem("expirationTime");

        setCurrentUser(null);

        navigate("/login"); // Navigate after clearing the state
    }

    async function updateToken() {
        const authTokens = JSON.parse(localStorage.getItem("authTokens"));

        if (authTokens && authTokens.refresh) {
            const response = await fetch(`${API_URL}token/refresh/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh: authTokens?.refresh }),
            });

            if (response.status === 200) {
                const data = await response.json();
                const newAuthTokens = { ...authTokens, access: data.access };
                localStorage.setItem("authTokens", JSON.stringify(newAuthTokens));
                localStorage.setItem("expirationTime", Date.now() + EXPIRATION_TIME);
                setCurrentUser({ ...currentUser, expirationTime: Date.now() + EXPIRATION_TIME });
            } else {
                logoutUser(); // Logout if refresh token fails
            }
        }
    }

    return {
        isLoggedIn,
        loginUser,
        logoutUser,
        currentUser,
        updateToken,
    };
}

export default useAuth;

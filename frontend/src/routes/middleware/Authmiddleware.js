import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import VerticalLayout from "components/VerticalLayout";
import HorizontalLayout from "components/HorizontalLayout";
import useAuth from "../../hooks/useAuth";

//constants
import {layoutTypes} from "../../constants/layout";
import {
    isUserAuthenticated,
    getAuthInfo,
    removeAuthInfo,
} from "../../helpers/auth";
import {Navigate, useNavigate} from "react-router-dom";

const Authmiddleware = (props) => {
    const {layoutType} = useSelector((state) => ({
        layoutType: state.Layout.layoutType,
    }));
    const {expirationTime} = getAuthInfo();
    const navigate = useNavigate();
    const {isLoggedIn, logoutUser, currentUser, updateToken} = useAuth();

    const getLayout = (layoutType) => {
        let Layout = VerticalLayout;
        switch (layoutType) {
            case layoutTypes.VERTICAL:
                Layout = VerticalLayout;
                break;
            case layoutTypes.HORIZONTAL:
                Layout = HorizontalLayout;
                break;
            default:
                break;
        }
        return Layout;
    };

    const Layout = getLayout(layoutType);
    
    // useEffect(() => {
    //     if (expirationTime && Date.now() > expirationTime) {
    //         removeAuthInfo(); // Clear the tokens
    //         navigate("/login"); // Redirect to login
    //     } else {
    //         // Check if the token is about to expire in the next hour
    //         if (expirationTime && Date.now() + (1000 * 60 * 60) > expirationTime) {
    //             updateToken(); // Try to refresh the token
    //         }
    //         const timeout = setTimeout(() => {
    //             removeAuthInfo();
    //             navigate("/login");
    //         }, expirationTime - Date.now());
    
    //         return () => {
    //             clearTimeout(timeout);
    //         };
    //     }
    // }, [expirationTime, updateToken]);    

    // if (!isUserAuthenticated()) {
    //     return <Navigate to="/login" replace={true} />;
    // }

    return (
        <React.Fragment>
            <Layout>{props.children}</Layout>
        </React.Fragment>
    );
};

export default Authmiddleware;
import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Page Imports
import Library from "pages/library";
import View from "pages/view";
import SplashScreen from "pages/splash";
import Reader from "pages/reader";
import Search from "pages/search";

import _ from "lodash";
import Page from "components/page";

// Utility
import DefaultThemeDark from "assets/themes/dark";

export default function App() {
    window.addEventListener("keydown", (e) => {
        if (e.key === "F12") {
            e.preventDefault();
        }
    });

    const Pages = _.mapValues(
        {
            Library,
            Reader,
            View,
            Search,
            SplashScreen,
        },
        (Route, key) => <Page id={key}>{<Route />}</Page>
    );

    return (
        <React.StrictMode>
            <ChakraProvider theme={extendTheme(DefaultThemeDark)}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={Pages.Library} />
                        <Route path="library" element={Pages.Library} />
                        <Route path="reader" element={Pages.Reader} />
                        <Route path="view" element={Pages.View} />
                        <Route path="search" element={Pages.Search} />
                        <Route path="splash" element={Pages.SplashScreen} />
                    </Routes>
                </BrowserRouter>
            </ChakraProvider>
        </React.StrictMode>
    );
}

import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Page Imports
import Library from "pages/library";
import View from "pages/view";
import SplashScreen from "pages/splash";
import Reader from "pages/reader";



// Utility
import DefaultThemeDark from "assets/themes/dark";
// TODO: Instead of directly writing the routes with the target page
//      we should use a function to setup any additional logic (i.e. redirecting),
//      and then return the logic after all is done.

export default function App() {
    window.addEventListener("keydown", (e) => {
        if (e.key === "F12") {
            e.preventDefault();
        }
    });

    return (
        <React.StrictMode>
            <ChakraProvider theme={extendTheme(DefaultThemeDark)}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Library />} />
                        <Route path="reader" element={<Reader />} />
                        <Route path="view" element={<View />} />
                        <Route path="splash" element={<SplashScreen />} />
                    </Routes>
                </BrowserRouter>
            </ChakraProvider>
        </React.StrictMode>
    );
}

import React from "react";
import MangaRouter from "components/router";
import { createBrowserHistory } from "history";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";

// Page Imports
import Library from "pages/library";
import View from "pages/view";
import SplashScreen from "pages/splash";
import Reader from "pages/reader";
import Search from "pages/search";
import Settings from "pages/settings";
// Utility
import DefaultThemeDark from "assets/themes/dark";

export default function App() {
    const history = createBrowserHistory();
    window.addEventListener("keydown", (e) => {
        if (e.key === "F12") {
            e.preventDefault();
        }
    });

    return (
        <React.StrictMode>
            <ChakraProvider theme={extendTheme(DefaultThemeDark)}>
                <MangaRouter history={history}>
                    <Routes>
                        <Route path="/" element={<Library />} />
                        <Route path="library" element={<Library />} />
                        <Route path="reader" element={<Reader />} />
                        <Route path="view" element={<View />} />
                        <Route path="search" element={<Search />} />
                        <Route path="splash" element={<SplashScreen />} />
                        <Route path="settings" element={<Settings />} />
                    </Routes>
                </MangaRouter>
            </ChakraProvider>
        </React.StrictMode>
    );
}

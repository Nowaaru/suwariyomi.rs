import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Page Imports
import BaseClass from "pages/main";
import Library from "pages/library";
import SplashScreen from "pages/splash";

// Utiltiy
import DefaultThemeDark from "assets/themes/dark";
// TODO: Instead of directly writing the routes with the target page
//      we should use a function to setup any additional logic (i.e. redirecting),
//      and then return the logic after all is done.

// TODO: Don't even think about using Enmaps. Use a Rust database library instead.

// TODO: Instead of having settings handled by react, create a Settings module
//      in Rust with a serializer function, then use Tauri to stream the serialized
//      settings to the client.

export default function App() {
    return (
        <React.StrictMode>
            <ChakraProvider theme={extendTheme(DefaultThemeDark)}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Library />} />
                        <Route path="splash" element={<SplashScreen />} />
                    </Routes>
                </BrowserRouter>
            </ChakraProvider>
        </React.StrictMode>
    );
}

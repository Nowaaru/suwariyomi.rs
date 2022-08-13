import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Page Imports
import BaseClass from "./pages/main";
import SplashScreen from "./pages/splash";

// TODO: Instead of directly writing the routes with the target page
//      we should use a function to setup any additional logic (i.e. redirecting),
//      and then return the logic after all is done.

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<BaseClass />} />
                <Route path="splash" element={<SplashScreen />} />
            </Routes>
        </BrowserRouter>
    );
}

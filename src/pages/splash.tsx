import React from "react";
import AppImage from "../assets/icon.png";

const SplashScreen = () => {
    return (
        <div
            style={{
                backgroundColor: "#FFFFFF00",
                borderRadius: "10px",
                background: "white",
                overflow: "hidden",
            }}
        >
            <h1
                style={{
                    color: "#FFFFFF",
                    borderRadius: "center",
                    fontSize: "3em",
                    fontWeight: "bold",
                    marginTop: "1em",
                    textShadow: "1px 1px 1px #000000",
                }}
            >
                <img src={AppImage} />
            </h1>
        </div>
    );
};

export default SplashScreen;

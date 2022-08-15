import { StyleSheet, Animation, css } from "aphrodite";
import React from "react";
import AppImage from "assets/icon.png";

const styles = StyleSheet.create({
    splash: {
        backgroundColor: "transparent",
        display: "block",
    },
    icon: {
        position: "relative",
        display: "block",
        width: 128,
        height: 128,
        right: 0,

        transform: "scale(1)",
        filter: "blur(0)",
        animation: new Animation({
            ["35%"]: {
                transform: "scale(1) rotate(0deg)",
                filter: "blur(0)",
            },
            ["40%"]: {
                transform: "scale(0.8) rotate(0deg)",
            },
            ["40.01%"]: {
                transform: "scale(0.8) rotate(0deg)",
                filter: "blur(4px)",
            },
            ["95%"]: {
                transform: "scale(0.8) rotate(calc(360deg * 8))",
                filter: "blur(4px)",
            },
            ["95.01%"]: {
                filter: "blur(0)",
                transform: "scale(0.8) rotate(0deg)",
            },
        }).finalize({
            iterations: "infinite",
            duration: "4s",
            easing: "linear",
        }),
    },
});

const SplashScreen = () => {
    return (
        <div className={css(styles.splash)}>
            <img className={css(styles.icon)} src={AppImage} />
        </div>
    );
};

export default SplashScreen;

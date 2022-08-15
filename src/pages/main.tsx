import { css, keyframes, StyleSheet } from "pages/util/aphrodite";
import { useMemo, useState } from "react";
import reactLogo from "../assets/react.svg";

const BasePage = () => {
    const [count, setCount] = useState(0);
    const styles = useMemo(() => {
        return StyleSheet.create({
            app: {
                fontFamily: "Inter,  Avenir,  Helvetica,  Arial,  sans-serif",
                lineHeight: "24px",
                fontWeight: 400,
                fontSize: "16px",

                backgroundColor: "rgba(0, 0, 0, 0.87)",
                colorScheme: "light dark",
                color: "rgba(255, 255, 255, 0.87)",

                fontSynthesis: "none",
                textRendering: "optimizeLegibility",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                WebkitTextSizeAdjust: "100%",

                position: "absolute",
                width: "100vw",
                height: "100vh",
                margin: "0 auto",
                padding: "2rem",
                textAlign: "center",

                "@media(prefers-color-scheme: light)": {
                    color: "#213547",
                    backgroundColor: "#FFFFFF",
                },
            },

            logo: {
                height: "6em",
                padding: "1em",
                willChange: "filter",
                "&:hover": {
                    filter: "drop-shadow(0 0 2em #646cffaa)",
                },
            },

            react: {
                filter: "drop-shadow(0 0 2em #61dafbaa)",
                "&:hover": {
                    filter: "brightness(0.8)",
                },
                animation: `${keyframes`
						from {
							transform: rotate(0deg);
						}
						to {
							transform: rotate(360deg);
						}
					`} infinite 20s linear`,
            },

            card: {
                padding: "2em",
            },

            a: {
                fontWeight: 500,
                color: "#646cff",
                textDecoration: "inherit",
                "&:hover": {
                    color: "#535bf2",
                },
                "@media(prefers-color-scheme: light)": {
                    "&:hover": {
                        color: "#747bff",
                    },
                },
            },

            h1: {
                fontSize: "3.2em",
                lineHeight: 1.1,
            },

            button: {
                "&:focus-visible": {
                    outline: "4px auto -webkit-focus-ring-color",
                },
                "&:focus": {
                    outline: "4px auto -webkit-focus-ring-color",
                },
                "&:hover": {
                    borderColor: "#646cff",
                },
                "@media(prefers-color-scheme: light)": {
                    backgroundColor: "#f9f9f9",
                },

                borderRadius: "8px",
                border: "1px solid transparent",
                padding: "0.6em 1.2em",
                fontSize: "1em",
                fontWeight: 500,
                fontFamily: "inherit",
                backgroundColor: "#1a1a1a",
                cursor: "pointer",
                transition: "border-color 0.25s",
            },

            "read-the-docs": {
                color: "#888888",
            },
        });
    }, []);

    return (
        <div id="application" className={css(styles.app)}>
            <div>
                <a
                    href="https://vitejs.dev"
                    className={css(styles.a)}
                    target="_blank"
                    rel="noreferrer"
                >
                    <img
                        src="/vite.svg"
                        className={css(styles.logo)}
                        alt="Vite logo"
                    />
                </a>
                <a
                    href="https://reactjs.org"
                    className={css(styles.a)}
                    target="_blank"
                    rel="noreferrer"
                >
                    <img
                        src={reactLogo}
                        className={css(styles.logo, styles.react)}
                        alt="React logo"
                    />
                </a>
            </div>
            <h1 className={css(styles.h1)}>Vite + React</h1>
            <div className={css(styles.card)}>
                <button
                    className={css(styles.button)}
                    onClick={() => setCount((count) => count + 1)}
                >
					count is {count}
                </button>
                <p>
					Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className={css(styles["read-the-docs"])}>
				Click on the Vite and React logos to learn more
            </p>
        </div>
    );
};

export default BasePage;

import { StyleSheet, css } from "util/aphrodite";
import { useState, useMemo } from "react";

const backgroundColor_high = "#101C28";
const backgroundColor_low = "#0D1620";

const objectAccent = "#fb8e84";
const textAccent = "f88379";
const Library = () => {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                library: {
                    background: `linear-gradient(to bottom, ${backgroundColor_high} -9%, ${backgroundColor_low} 32%)`,
                    padding: "1em",
                    width: "100vw",
                    height: "100vh",
                    fontFamily: "Cascadia Code",
                },
                welcomeFieldContainer: {
                    width: "fit-content",
                    padding: "6px",
                    boxSizing: "border-box",
                    backgroundColor: backgroundColor_low,
                    borderLeftColor: objectAccent,
                    borderRightColor: objectAccent,
                },
                welcomeTextContainer: {
                    position: "relative",
                    top: "2px",
                    borderRadius: "9px 9px 0 0",
                    borderWidth: "2px 2px 0 2px",
                    borderBottomColor: objectAccent,
                },
                welcomeText: {
                    fontSize: "48px",
                    height: "72px",
                    color: "white",
                },
                welcomeContainer: {
                    display: "flex",
                    color: "white",
                    marginTop: "2em",
                    marginLeft: "2em",
                    flexDirection: "column",
                },
                suggestionTextContainer: {
                    borderRadius: "0 9px 9px 9px",
                    borderWidth: "2px 2px 2px 2px",
                    borderTopColor: objectAccent,
                    borderBottomColor: objectAccent,
                },
                suggestionText: {
                    display: "inline-block",
                    fontSize: "32px",
                },
                recommendation: {
                    "::before": {
                        content: "\" \"",
                    },
                },
                accent: {
                    color: "#f88379",
                },
                line: {
                    position: "absolute",
                    borderColor: backgroundColor_high,
                    borderTop: "dashed 1px",
                    width: "100%",
                    top: "32%",
                    left: 0,
                },
            }),
        []
    );

    return (
        <div className={css(styles.library)}>
            <div className={css(styles.welcomeContainer)}>
                <div className={css(styles.welcomeTextContainer, styles.welcomeFieldContainer)}>
                    <h1 className={css(styles.welcomeText)}>Welcome back.</h1>
                </div>
                <div className={css(styles.suggestionTextContainer, styles.welcomeFieldContainer)}>
                    <h3 className={css(styles.suggestionText)}>
                        Is it time to read
                        <span
                            className={css(
                                styles.recommendation,
                                styles.accent
                            )}
                        >
                            Prunus Girl
                        </span>
                        ?
                    </h3>
                </div>
            </div>
            <hr className={css(styles.line)} />
        </div>
    );
};

export default Library;

import _ from "lodash";

const backgroundColor_high = "rgb(18, 30, 42)";
const backgroundColor_low = "#0D1620";

const objectAccent = "#fb8e84";
const textAccent = "f88379";

const Library = () => {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                library: {
                    backgroundColor: backgroundColor_low,
                    position: "absolute",
                    padding: "1em",
                    width: "100vw",
                    height: "100vh",
                    fontFamily: "Cascadia Code",
                    zIndex: -2,
                },
                topStyle: {
                    position: "absolute",
                    background: `linear-gradient(to bottom, ${backgroundColor_high} 0%, ${backgroundColor_low} 100%)`,
                    width: "100vw",
                    height: "322px",
                    top: 0,
                    right: 0,
                    zIndex: -1,
                },
                welcomeFieldContainer: {
                    width: "fit-content",
                    padding: "4px 20px",
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
                    borderTopColor: objectAccent,
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
                    paddingTop: "2px",
                    borderRadius: "0 9px 9px 9px",
                    borderWidth: "2px 2px 2px 2px",
                    borderTopColor: objectAccent,
                    borderBottomColor: objectAccent,
                },
                suggestionText: {
                    display: "inline-block",
                    fontSize: "32px",
                },
                libraryButtons: {
                    marginTop: "1em",
                    marginLeft: "48px",
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
                    top: "322px",
                    left: 0,
                },
            }),
        []
    );

    return (
        <div className={css(styles.library)}>
            <div className={css(styles.welcomeContainer)}>
                <div className={css(styles.topStyle)} />
                <div
                    className={css(
                        styles.welcomeTextContainer,
                        styles.welcomeFieldContainer
                    )}
                >
                    <h1 className={css(styles.welcomeText)}>Welcome back.</h1>
                </div>
                <div
                    className={css(
                        styles.suggestionTextContainer,
                        styles.welcomeFieldContainer
                    )}
                >
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
            <ButtonGroup
                className={css(styles.libraryButtons)}
                variant="solid"
                spacing="32px"
            >
                <IconButton
                    outlineColor={objectAccent}
                    aria-label="Settings"
                    icon={<SettingsIcon />}
                />
                <IconButton
                    outlineColor={objectAccent}
                    aria-label="History"
                    icon={<TimeIcon />}
                />
                <IconButton
                    outlineColor={objectAccent}
                    aria-label="Sources"
                    icon={<DownloadIcon />}
                />
            </ButtonGroup>
            <hr className={css(styles.line)} />
        </div>
    );
};

export default Library;

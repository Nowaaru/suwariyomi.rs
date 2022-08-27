import { StyleSheet, css } from "aphrodite";
import { useMemo } from "react";

import {
    Tooltip,
    Text,
    Button,
} from "@chakra-ui/react";

const View = () => {
    // manga shit 275x435
    // 2px white border 
    const styles = useMemo(() => StyleSheet.create({
        main: {
            display: "block",
            backgroundColor: "#0D1620",
            zIndex: -10,
            width: "100vw",
            height: "100vh",
        },
        top: {
            display: "flex",
            position: "relative",
            width: "100vw",
            height: "600px",
        },
        bgwrapper: {
            width: "100%",
            height: "400px",
            overflow: "hidden",
            position: "absolute",
            zIndex: 0,
            "::after": {
                position: "absolute",
                top: "0",
                content: "' '",
                width: "100%",
                height: "400px",

                background: "linear-gradient(0deg, rgba(13,22,32) 0%, rgba(13,22,32,0) 100%)",
            }
        },
        bg: {
            position: "relative",
            width: "100%",
            objectFit: "contain",
            overflow: "hidden",
        },
        meta: {
            display: "flex",
            flexDirection: "row",
            zIndex: 2,
            marginLeft: "200px",
            maxHeight: "400px",
            flexGrow: 1,
            paddingTop: "140px",
            boxSizing: "border-box",
        },
        cover: {
            position: "relative",
            width: "275px",
            height: "fit-content",
            maxHeight: "435px",
            borderWidth: "2px",
            borderColor: "#FFF",
            borderRadius: "6px",
            marginRight: "24px",
        },
        badge: {
            position: "absolute",
            display: "flex",
            borderRadius: "50%",
            overflow: "hidden",
            backgroundColor: "#fb8e84",
            width: "48px",
            height: "48px",
            top: "-16px",
            left: "-16px",
            justifyContent: "center",
            boxSizing: "border-box",
            padding: "6px",
        },
        badgeimg: {
            maxWidth: "48px",
            maxHeight: "48px",
        },
        coverimg: {
            objectFit: "contain",
        },
        text: {
            fontFamily: "Cascadia Code",
            color: "whitesmoke",
        },
        title: {
            fontSize: "48px",
            marginBottom: "-8px",
        },
        mainauthor: {
            cursor: "pointer",
            textDecorationLine: "underline",
            textDecorationColor: "#f8837900",
            transition: "text-decoration-color 0.1s ease-in",
            ":hover": {
                textDecorationColor: "#f88379"
            }
        },
        author: {
            fontSize: "24px",
        },
        accent: {
            color: "#f88379",
        },
        description: {},
        details: {
            
        },
        line: {
            position: "absolute",
            top: "397px",
            borderColor: "rgb(18,30,42)",
            borderTop: "dashed 1px",
            width: "100%",
            left: 0,
        },
        buttons: {
            marginTop: "48px",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexDirection: "column",
        },
        startreading: {
            marginTop: "32px",
            height: "80px",
            width: "600px",
            marginBottom: "6px"
        },
        trackers: {
            width:"240px",
        },
    }), []);

    return <div className={css(styles.main)}>
        <div className={css(styles.top)}>
            <div className={css(styles.bgwrapper)}>
                <img src="https://s4.anilist.co/file/anilistcdn/media/manga/banner/100584-a1AUafu5CSlg.jpg" className={css(styles.bg)} />
            </div>
            <hr className={css(styles.line)} />
            <div className={css(styles.meta)}>
                <div className={css(styles.cover)}>
                    <Tooltip label="Click to go to the manga's webpage.">
                        <button className={css(styles.badge)}>
                            <img src="https://www.mangadex.org/favicon.ico" />
                        </button>
                    </Tooltip>
                    <img src="https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/nx100584-nsNlmE5aTDhe.jpg" className={css(styles.coverimg)} />
                </div>
                <div className={css(styles.details)}>
                    <h1 className={css(styles.title, styles.text)}>
                        Sewayaki Kitsune no Senko-san
                    </h1>
                    <span className={css(styles.text, styles.author)}>
                        by <Tooltip label="Click to search this artist.">
                            <a className={css(styles.accent, styles.mainauthor)}>Rimukoro</a>    
                        </Tooltip>
                    </span>
                    <Text 
                        className={css(styles.description, styles.text)}
                        maxWidth="600px"
                        marginTop="24px"
                        fontSize="14px"
                        fontFamily="Cascadia Code"
                        noOfLines={4}
                    >
                        {`The everyday life of Nakano, a salaryman working for an exploitative company, is suddenly intruded upon by the Kitsune, Senko-san (800 Years Old - Young Wife). Whether it be cooking, cleaning, or a special service...She'll heal his exhaustion with her tender care.`}
                    </Text>
                    <div className={css(styles.buttons)}>
                        <Button 
                            backgroundColor={"#fb8e84"}
                            color="whitesmoke"
                            _hover={{
                                bg: "#f88379",
                            }}
                            className={css(styles.startreading)}
                        >
                            Start Reading Volume 2 Chapter 3
                        </Button>
                        <Button
                            backgroundColor={"#fb8e84"}
                            color="whitesmoke"
                            _hover={{
                                bg: "#f88379",
                            }}
                            className={css(styles.trackers)}
                        >
                            Configure Trackers
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>;
};

export default View;

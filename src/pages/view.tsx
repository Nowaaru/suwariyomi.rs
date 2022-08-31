import { StyleSheet, css } from "aphrodite";
import { useMemo } from "react";
import Chapter from "components/chapter";
import _ from "lodash";

import {
    Tooltip,
    Text,
    Button,
    Tag,
    TagLabel,
    Progress,
} from "@chakra-ui/react";
import {
    chapterLastUpdated,
    compileChapterText,
    compileChapterTitle,
    formatDate,
    isChapterCompleted,
} from "util/textutil";

// TODO: Automatically scroll to the last-read chapter
// TODO: When starting to read a chapter, look at the scanlators
//       of the last-read chapter to determine which chapter to pick.
//       If said scanlator did not scanlate the next chapter, then
//       choose the first one.

const View = () => {
    // manga shit 275x435
    // 2px white border
    const styles = useMemo(
        () =>
            StyleSheet.create({
                main: {
                    display: "flex",
                    backgroundColor: "#0D1620",
                    zIndex: -10,
                    width: "100vw",
                    height: "100vh",
                    flexDirection: "column",
                    overflowX: "hidden",

                    "&::-webkit-scrollbar": {
                        width: "8px",
                    },

                    "&::-webkit-scrollbar-track": {
                        background: "#00000000",
                    },

                    "&::-webkit-scrollbar-thumb": {
                        background: "#fb8e84",
                        borderRadius: "2px",
                    },

                    "&::-webkit-scrollbar-thumb:hover": {
                        background: "#f88379",
                    },
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

                        background:
                            "linear-gradient(0deg, rgba(13,22,32) 0%, rgba(13,22,32,0) 100%)",
                    },
                },
                bg: {
                    position: "relative",
                    minWidth: "150%",
                    height: "150%",
                    right: "400px",
                    objectFit: "fill",
                    overflow: "hidden",
                },
                meta: {
                    "@media (max-width: 800px)": {
                        marginLeft: "25px",
                    },
                    "@media (max-width: 900px)": {
                        marginLeft: "75px",
                    },
                    transition: "margin-left 1s ease-in-out",
                    display: "flex",
                    flexDirection: "row",
                    zIndex: 2,
                    marginLeft: "10%",
                    marginRight: "10%",
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
                    "@media (max-width: 1400px)": {
                        fontSize: "28px",
                    },
                    transition: "font-size 1s ease-in-out",
                    fontSize: "48px",
                    marginBottom: "-8px",
                },
                mainauthor: {
                    cursor: "pointer",
                    textDecorationLine: "underline",
                    textDecorationColor: "#f8837900",
                    transition: "text-decoration-color 0.1s ease-in",
                    ":hover": {
                        textDecorationColor: "#f88379",
                    },
                },
                author: {
                    fontSize: "24px",
                },
                accent: {
                    color: "#f88379",
                },
                description: {
                    "@media (max-width: 900px)": {
                        fontSize: "16px",
                        maxWidth: "300px",
                    },
                    fontSize: "14px",
                    maxWidth: "600px",
                },
                details: {},
                lineabsolute: {
                    position: "absolute",
                    top: "397px",
                },
                line: {
                    borderColor: "rgb(18,30,42)",
                    borderTop: "dashed 1px",
                    marginTop: "14px",
                    marginBottom: "14px",
                    width: "100%",
                    left: 0,
                },
                buttons: {
                    "@media (max-width: 900px)": {
                        marginTop: "6px",
                        marginLeft: "0px",
                    },
                    "@media (min-width: 900px)": {
                        marginTop: "64px",
                    },
                    marginTop: "36px",
                    display: "flex",
                    maxWidth: "600px",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    flexDirection: "column",
                },
                startreading: {
                    "@media (max-width: 900px)": {
                        width: "85%",
                    },
                    transition: "width 1s ease-in-out",
                    marginTop: "32px",
                    height: "80px",
                    width: "100%",
                    marginBottom: "6px",
                },
                trackers: {
                    width: "240px",
                },

                bottom: {
                    width: "100%",
                    display: "flex",
                    marginBottom: "36px",
                    flexDirection: "row",
                },

                metabottom: {
                    width: "430px",
                    height: "fit-content", //"530px",
                    backgroundColor: "#142333",
                    marginTop: "24px",
                    marginLeft: "10%",
                    borderRadius: "6px",
                    borderColor: "#00000022",
                    borderWidth: "4px",
                },

                tagscontainer: {
                    fontFamily: "Cascadia Code",
                    color: "whitesmoke",
                    padding: "16px",
                    fontSize: "20px",
                },

                tags: {
                    marginTop: "8px",
                },

                tag: {
                    marginRight: "4px",
                    marginBottom: "6px",
                },

                flex: {
                    display: "flex",
                },

                column: {
                    flexDirection: "column",
                },

                lastreadcontainer: {
                    marginBottom: "12px",
                },

                lastupdatedcontainer: {},

                progresscontainer: {
                    marginTop: "12px",
                },

                row: {
                    flexDirection: "row",
                },

                progress: {
                    justifyContent: "space-evenly",
                },

                bar: {
                    display: "flex",
                    flexGrow: 1,
                },

                progresstext: {
                    display: "flex",
                    flexGrow: 0,
                    verticalAlign: "middle",
                    lineHeight: "23px",
                    textAlign: "right",
                    float: "right",
                    marginLeft: "32px",
                },

                chapters: {
                    maxWidth: "800px",
                    width: "50%",
                    height: "fit-content",
                    maxHeight: "530px",
                    overflowY: "scroll",
                    overscrollBehavior: "none",
                    backgroundColor: "#142333",
                    marginLeft: "125px",
                    marginTop: "24px",
                    borderRadius: "6px",
                    borderWidth: "4px",
                    borderColor: "#00000022",

                    "&::-webkit-scrollbar": {
                        width: "8px",
                    },

                    "&::-webkit-scrollbar-track": {
                        background: "#00000000",
                    },

                    "&::-webkit-scrollbar-thumb": {
                        background: "#fb8e84",
                        borderRadius: "2px",
                    },

                    "&::-webkit-scrollbar-thumb:hover": {
                        background: "#f88379",
                    },
                },
            }),
        []
    );

    const rawChapterData = useMemo(() => {
        const y = [];
        for (let i = 32; i > 0; i--) {
            const maxPages = 15; // _.random(0, 72);
            const curRead = 15; //_.random(0, maxPages);
            y.push({
                id: `0000-0000-00${String(i).padStart(2, "0")}`,
                manga_id: "1111-1111-1111",
                volume: 1 + Math.floor(i / 4),
                chapter: i,

                last_read: Date.now() * 0.95,
                date_uploaded: Date.now() * ((65 + i) / 100),
                last_updated: Date.now() * 0.75,
                time_spent_reading: 44083134,

                pages: curRead,
                count: maxPages,
                scanlators: ["Gouma-Den"],
            });
        }

        return y;
    }, []);

    const chapterElements = useMemo(() => {
        return rawChapterData.map((e) => <Chapter key={e.id} chapter={e} />);
    }, [rawChapterData]);

    const possibleTags = useMemo(
        () => [
            "Gore",
            "Sexual Violence",
            "4-Koma",
            "Adaptation",
            "Anthology",
            "Oneshot",
            "Doujinshi",
            "Action",
            "Adventure",
            "Comedy",
            "Crime",
            "Drama",
            "Fantasy",
            "Historical",
            "Horror",
            "Isekai",
            "Magical Girls",
            "Mecha",
            "Medical",
            "Mystery",
            "Philosophical",
            "Psychological",
            "Romance",
            "Sci-Fi",
            "Slice of Life",
            "Sports",
            "Superhero",
            "Thriller",
            "Tragedy",
            "Wuxia",
        ],
        []
    );

    const firstUnreadChapter = rawChapterData
        .filter((x) => !isChapterCompleted(x))
        .map((y) => ({ i: y, ch: y.chapter }))
        .sort((a, b) => a.ch - b.ch)[0];
    const chapterPre =
        firstUnreadChapter?.i.pages > 0 ? "Continue Reading" : "Start Reading";
    const chapterDisplay = firstUnreadChapter
        ? `${chapterPre} ${compileChapterTitle(
              firstUnreadChapter.i,
              false,
              true
          )}`
        : undefined;
    const readingButtonDisplay = firstUnreadChapter
        ? chapterDisplay
        : "All chapters completed.";

    // Calculate progress percentage
    // Iterate over every chapter; this is mapped to pages/count.
    const percentage =
        Math.floor((_.clamp(
            Math.floor(
                rawChapterData
                    .map((x) => x.pages / (x.count || 1))
                    .reduce((acc, v) => acc + v, 0)
            ),
            0,
            100
        ) /
            rawChapterData.length) *
        100);
    return (
        <div className={css(styles.main)}>
            <div className={css(styles.top)}>
                <div className={css(styles.bgwrapper)}>
                    <img
                        src="https://s4.anilist.co/file/anilistcdn/media/manga/banner/100584-a1AUafu5CSlg.jpg"
                        className={css(styles.bg)}
                    />
                </div>
                <hr className={css(styles.line, styles.lineabsolute)} />
                <div className={css(styles.meta)}>
                    <div className={css(styles.cover)}>
                        <Tooltip label="Click to go to the manga's webpage.">
                            <button className={css(styles.badge)}>
                                <img src="https://www.mangadex.org/favicon.ico" />
                            </button>
                        </Tooltip>
                        <img
                            src="https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/nx100584-nsNlmE5aTDhe.jpg"
                            className={css(styles.coverimg)}
                        />
                    </div>
                    <div className={css(styles.details)}>
                        <h1 className={css(styles.title, styles.text)}>
                            Sewayaki Kitsune no Senko-san
                        </h1>
                        <span className={css(styles.text, styles.author)}>
                            by{" "}
                            <Tooltip label="Click to search this artist.">
                                <a
                                    className={css(
                                        styles.accent,
                                        styles.mainauthor
                                    )}
                                >
                                    Rimukoro
                                </a>
                            </Tooltip>
                        </span>
                        <Text
                            className={css(styles.description, styles.text)}
                            marginTop="24px"
                            fontFamily="Cascadia Code"
                            noOfLines={4}
                        >
                            {`The everyday life of Nakano, a salaryman working for an exploitative company, is suddenly intruded upon by the Kitsune, Senko-san (800 Years Old - Young Wife). Whether it be cooking, cleaning, or a special service...She'll heal his exhaustion with her tender care.`}
                        </Text>
                        <div className={css(styles.buttons)}>
                            <Tooltip
                                label={
                                    firstUnreadChapter &&
                                    firstUnreadChapter.i.pages > 0
                                        ? `Page ${firstUnreadChapter.i.pages}/${firstUnreadChapter.i.count}`
                                        : undefined
                                }
                                placement="top"
                                hasArrow
                            >
                                <Button
                                    backgroundColor={"#fb8e84"}
                                    color="whitesmoke"
                                    _hover={{
                                        bg: "#f88379",
                                    }}
                                    className={css(styles.startreading)}
                                    disabled={!firstUnreadChapter}
                                >
                                    {readingButtonDisplay}
                                </Button>
                            </Tooltip>
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
            <div className={css(styles.bottom)}>
                <div className={css(styles.metabottom)}>
                    <div className={css(styles.tagscontainer)}>
                        <span> Tags </span>
                        <div className={css(styles.tags)}>
                            {(() => {
                                const finalizedArray = [];
                                for (
                                    let i = 0;
                                    i < _.random(0, possibleTags.length - 1);
                                    i++
                                ) {
                                    finalizedArray.push(
                                        possibleTags.splice(
                                            possibleTags.indexOf(
                                                _.sample(possibleTags) ?? ""
                                            ),
                                            1
                                        )[0]
                                    );
                                }

                                return finalizedArray.map((v) => (
                                    <Tag
                                        backgroundColor="#fb8e84"
                                        color="white"
                                        className={css(styles.tag)}
                                        key={v}
                                    >
                                        {v}
                                    </Tag>
                                ));
                            })()}
                        </div>
                        <hr className={css(styles.line)} />
                        <div
                            className={css(
                                styles.flex,
                                styles.column,
                                styles.lastreadcontainer
                            )}
                        >
                            <span>Last Read</span>
                            <span>
                                {formatDate(
                                    rawChapterData
                                        .map((y) => y.last_read)
                                        .sort((a, b) => b - a)[0]
                                )}
                            </span>
                        </div>
                        <div
                            className={css(
                                styles.flex,
                                styles.column,
                                styles.lastupdatedcontainer
                            )}
                        >
                            <span>Last Updated</span>
                            <span>
                                {formatDate(
                                    rawChapterData
                                        .map(chapterLastUpdated)
                                        .reduce((acc, v) => {
                                            return v > acc ? v : acc;
                                        }, -1)
                                )}
                            </span>
                        </div>
                        <div
                            className={css(
                                styles.flex,
                                styles.column,
                                styles.progresscontainer
                            )}
                        >
                            <span>Progress</span>
                            <Tooltip
                                isDisabled={percentage !== 100}
                                label="Congratulations!"
                            >
                                <div
                                    className={css(
                                        styles.progress,
                                        styles.row,
                                        styles.flex
                                    )}
                                >
                                    <Progress
                                        height="8px"
                                        marginTop="8px"
                                        borderRadius="8px"
                                        backgroundColor="#00000022"
                                        value={percentage}
                                        className={css(styles.bar)}
                                        hasStripe={percentage === 100}
                                        sx={{
                                            "& div": {
                                                backgroundColor: "#fb8e84",
                                            },
                                        }}
                                    />
                                    <span className={css(styles.progresstext)}>
                                        {percentage}%
                                    </span>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <div className={css(styles.chapters)}>{chapterElements}</div>
            </div>
        </div>
    );
};

export default View;

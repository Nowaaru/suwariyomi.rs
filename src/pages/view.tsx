import { css, StyleSheet } from "aphrodite";
import { useEffect, useMemo, useState } from "react";
import { Chapter, Manga } from "types/manga";
import { MangaDB } from "util/db";

import BackButton from "components/backbutton";
import CircularProgress from "components/circularprogress";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import SourceHandler, { Source } from "util/sources";

import {
    Button,
    ButtonGroup,
    Progress,
    Tag,
    Text,
    Tooltip,
} from "@chakra-ui/react";
import ChapterComponent from "components/chapter";
import { useSearchParams } from "react-router-dom";
import { stripHtml } from "string-strip-html";
import {
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

    const Navigate = useNavigate();
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
                    minWidth: "180%",
                    minHeight: "180%",
                    transform: "translateX(-25%) translateY(-50%)",
                    objectFit: "fill",
                    overflow: "hidden",
                    filter: "brightness(0.2)",
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
                    maxWidth: "271px",
                    maxHeight: "384px",
                    height: "fit-content",
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

                addtolibrary: {
                    width: "240px",
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

                backbutton: {
                    top: "20px",
                    left: "15px",
                    position: "sticky",
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

                loadingPage: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    verticalAlign: "middle",
                    width: "100vw",
                    height: "100vh",
                },
            }),
        []
    );

    const [queryParams] = useSearchParams();
    const [mangaSource, setMangaSource] = useState<string | null>();
    const [mangaId, setMangaId] = useState<string | null>();

    const [mangaData, setMangaData] = useState<Manga | null>(null);
    const [rawChapterData, setChapterData] = useState<Array<Chapter> | null>(
        null
    );
    const [sourceHandler, setHandler] = useState<Source | null>(null);

    useEffect(() => {
        if (!mangaSource) return undefined;
        SourceHandler.querySource(mangaSource).then((source) =>
            source ? setHandler(source) : null
        );
    }, [mangaSource]);

    useEffect(() => {
        const source = queryParams.get("source");
        const id = queryParams.get("id");

        setMangaSource(source);
        setMangaId((mangaId) => id ?? mangaId);
    }, [queryParams]);

    useEffect(() => {
        if (!mangaId || !mangaSource) return;
        if (!sourceHandler) return;
        if (mangaData) return;

        // first, determine whether the manga is in-cache.
        MangaDB.get(mangaId, mangaSource)
            .then((foundManga) => {
                if (!foundManga)
                    return sourceHandler.getManga(mangaId).then((data) => {
                        if (!data) setMangaData(null);
                        MangaDB.insert(data)
                            .then(() =>
                                console.log(
                                    "Successfully added manga to cache."
                                )
                            )
                            .catch(console.error);
                        setMangaData(data ?? null);
                    });

                console.log("found it!");
                setMangaData(foundManga as Manga);
            })
            .catch(console.error);
    }, [mangaId, sourceHandler, mangaData, mangaSource]);

    useEffect(() => {
        if (!sourceHandler) return;
        if (!mangaId) return;

        sourceHandler
            ?.getChapters(mangaId)
            .then((unchangedData) =>
                unchangedData
                    .filter(({ lang }) => lang === "en")
                    .sort(
                        ({ chapter: aChapter }, { chapter: bChapter }) =>
                            bChapter - aChapter
                    )
            )
            .then(setChapterData);
    }, [mangaId, sourceHandler]);

    const chapterElements = useMemo(() => {
        if (!rawChapterData) return [];
        if (!sourceHandler) return [];

        return rawChapterData.map((e) => (
            <ChapterComponent
                key={e.id}
                chapter={e as Chapter}
                source={sourceHandler.id}
            />
        ));
    }, [rawChapterData, sourceHandler]);

    if (mangaData && Array.isArray(rawChapterData)) {
        const firstUnreadChapter = rawChapterData
            .filter((x) => !isChapterCompleted(x))
            .map((y) => ({ i: y, ch: y.chapter }))
            .sort((a, b) => a.ch - b.ch)[0];
        const chapterPre =
            firstUnreadChapter?.i.pages > 0
                ? "Continue Reading"
                : "Start Reading";
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
        const percentage = Math.floor(
            (_.clamp(
                Math.floor(
                    rawChapterData
                        .map((x) =>
                            x.pages > 0 && x.total > 0 ? x.pages / x.total : 0
                        )
                        .reduce((acc, v) => acc + v, 0)
                ),
                0,
                100
            ) /
                rawChapterData.length) *
                100
        );

        const isAdded = mangaData.added && mangaData.added !== -1;
        const lastUpdated = formatDate(
            rawChapterData.reduce((acc, v) => {
                return v.last_updated > acc ? v.last_updated : acc;
            }, -1)
        );
        const lastRead = formatDate(
            rawChapterData.map((y) => y.last_read).sort((a, b) => b - a)[0]
        );

        const tagsDisplay = mangaData.tags.map((key) => (
            <Tag
                backgroundColor="#fb8e84"
                color="white"
                className={css(styles.tag)}
                key={key}
            >
                {key}
            </Tag>
        ));
        return (
            <div className={css(styles.main)}>
                <div className={css(styles.top)}>
                    <div className={css(styles.bgwrapper)}>
                        <img
                            src={mangaData.covers[0]}
                            className={css(styles.bg)}
                        />
                    </div>
                    <BackButton className={css(styles.backbutton)} />
                    <hr className={css(styles.line, styles.lineabsolute)} />
                    <div className={css(styles.meta)}>
                        <div className={css(styles.cover)}>
                            {sourceHandler ? (
                                <Tooltip label="Click to go to the manga's webpage.">
                                    <button
                                        onClick={() =>
                                            open(
                                                sourceHandler?.getMangaUrl(
                                                    mangaData?.id
                                                )
                                            )
                                        }
                                        className={css(styles.badge)}
                                    >
                                        <img src={sourceHandler?.icon} />
                                    </button>
                                </Tooltip>
                            ) : null}
                            <img
                                src={mangaData.covers[0]}
                                className={css(styles.coverimg)}
                            />
                        </div>
                        <div className={css(styles.details)}>
                            <h1 className={css(styles.title, styles.text)}>
                                {mangaData.name}
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
                                        {mangaData.authors.join(", ")}
                                    </a>
                                </Tooltip>
                            </span>
                            <Text
                                className={css(styles.description, styles.text)}
                                marginTop="24px"
                                fontFamily="Cascadia Code"
                                noOfLines={4}
                            >
                                {
                                    stripHtml(
                                        mangaData.description ??
                                            "No description provided."
                                    ).result
                                }
                            </Text>
                            <div className={css(styles.buttons)}>
                                <Tooltip
                                    label={
                                        firstUnreadChapter &&
                                        firstUnreadChapter.i.pages > 0
                                            ? `Page ${firstUnreadChapter.i.pages}/${firstUnreadChapter.i.total}`
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
                                        onClick={() => {
                                            if (firstUnreadChapter)
                                                return Navigate(
                                                    `/reader?source=${mangaData.source}&manga=${mangaData.id}&chapter=${firstUnreadChapter.i.id}`
                                                );
                                        }}
                                        disabled={!firstUnreadChapter}
                                    >
                                        {readingButtonDisplay}
                                    </Button>
                                </Tooltip>
                                <ButtonGroup>
                                    <Button
                                        backgroundColor={"#fb8e84"}
                                        color="whitesmoke"
                                        _hover={{
                                            bg: "#f88379",
                                        }}
                                        className={css(styles.addtolibrary)}
                                        onClick={() => {
                                            const newManga = {
                                                ...mangaData,
                                                added: isAdded
                                                    ? -1
                                                    : Date.now(),
                                            };

                                            MangaDB.insert(newManga)
                                                .then(() =>
                                                    console.log("updated")
                                                )
                                                .catch(console.error);

                                            setMangaData(newManga);
                                        }}
                                    >
                                        {isAdded
                                            ? "Remove from Library"
                                            : "Add to Library"}
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
                                </ButtonGroup>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={css(styles.bottom)}>
                    <div className={css(styles.metabottom)}>
                        <div className={css(styles.tagscontainer)}>
                            <span> Tags </span>
                            <div className={css(styles.tags)}>
                                {mangaData.tags?.length > 0 ? (
                                    tagsDisplay
                                ) : (
                                    <Text
                                        fontFamily="Cascadia Code"
                                        color="#88888866"
                                        fontSize="16px"
                                        marginLeft="8px"
                                    >
                                        None
                                    </Text>
                                )}
                            </div>
                            {isAdded ? (
                                <>
                                    <hr className={css(styles.line)} />
                                    {lastRead !== -1 ? (
                                        <div
                                            className={css(
                                                styles.flex,
                                                styles.column,
                                                styles.lastreadcontainer
                                            )}
                                        >
                                            <span>Last Read</span>
                                            <span>{lastRead}</span>
                                        </div>
                                    ) : null}

                                    {lastUpdated !== -1 ? (
                                        <div
                                            className={css(
                                                styles.flex,
                                                styles.column,
                                                styles.lastupdatedcontainer
                                            )}
                                        >
                                            <span>Last Updated</span>
                                            <span>{lastUpdated}</span>
                                        </div>
                                    ) : null}
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
                                                    hasStripe={
                                                        percentage === 100
                                                    }
                                                    sx={{
                                                        "& div": {
                                                            backgroundColor:
                                                                "#fb8e84",
                                                        },
                                                    }}
                                                />
                                                <span
                                                    className={css(
                                                        styles.progresstext
                                                    )}
                                                >
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                    <div className={css(styles.chapters)}>
                        {chapterElements}
                    </div>
                </div>
            </div>
        );
    }

    // UI for loading, time elapsed
    return (
        <div className={css(styles.main)}>
            <div className={css(styles.loadingPage)}>
                <CircularProgress showTimeElapsed display="flex" />
            </div>
        </div>
    );
};

export default View;

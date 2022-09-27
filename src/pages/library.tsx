import { StyleSheet, css, rgba } from "util/aphrodite";
import LibrarySource from "components/librarysource";
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import _ from "lodash";
import {
    ButtonGroup,
    IconButton,
    IconButtonProps,
    Tooltip,
} from "@chakra-ui/react";
import {
    DownloadIcon,
    InfoIcon,
    RepeatIcon,
    SettingsIcon,
    TimeIcon,
    ViewIcon,
    SearchIcon,
} from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import SourceHandler, { Source } from "util/sources";
import { MangaDB } from "util/db";
import { Manga } from "types/manga";

const backgroundColor_high = "rgb(18, 30, 42)";
const backgroundColor_low = "#0D1620";

const objectAccent = "#fb8e84";
const textAccent = "#f88379";

const libraryVariants: Variants = {
    hidden: {
        opacity: 0,
        transition: {
            duration: 0.5,
            ease: "easeInOut",
        },
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeInOut",
        },
    },
};
const LibraryButton = (props: IconButtonProps) => {
    const modifiedProps = {
        ...props,
        sx: {
            ...props.sx,
            backgroundColor: backgroundColor_low,
            "&:hover": {
                backgroundColor: backgroundColor_high,
            },
            "& .chakra-icon": {
                color: textAccent,
            },
        },
    };
    return (
        <Tooltip label={props["aria-label"]}>
            <IconButton {...modifiedProps} outlineColor={objectAccent} />
        </Tooltip>
    );
};

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
                    overflowX: "hidden",
                    overflowY: "auto",

                    "&::-webkit-scrollbar": {
                        width: "8px",
                    },

                    "&::-webkit-scrollbar-track": {
                        background: "#00000000",
                    },

                    "&::-webkit-scrollbar-thumb": {
                        background: objectAccent,
                        borderRadius: "2px",
                    },

                    "&::-webkit-scrollbar-thumb:hover": {
                        background: textAccent,
                    },
                },
                topStyle: {
                    position: "absolute",
                    background: `linear-gradient(to bottom, ${backgroundColor_high} 65%, ${backgroundColor_low} 100%)`,
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
                    minWidth: "420px",
                    maxWidth: "420px",
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
                    position: "relative",
                    display: "inline-block",
                    paddingTop: "2px",
                    borderRadius: "0 9px 9px 9px",
                    borderWidth: "2px 2px 2px 2px",
                    borderTopColor: objectAccent,
                    borderBottomColor: objectAccent,
                    minWidth: "434px",
                    maxWidth: "800px",
                    maxHeight: "125px",
                    "::before": {
                        content: "' '",
                        position: "absolute",
                        width: "416px",
                        height: "2px",
                        top: "-2px",
                        left: "0",
                        backgroundColor: backgroundColor_low,
                        zIndex: 2,
                    },
                },
                suggestionText: {
                    position: "relative",
                    display: "inline-block",
                    fontSize: "24px",
                },
                libraryButton: {
                    marginTop: "1em",
                    marginLeft: "48px",
                },
                randomizeButton: {
                    "&&": {
                        position: "relative",
                        verticalAlign: "middle",
                        marginLeft: "6px",
                        color: textAccent,
                        width: "30px",
                        height: "32px",
                        "&:hover": {
                            backgroundColor: rgba(0xf8, 0x83, 0x79, 0.1),
                        },
                    },
                },
                randomizeIcon: {
                    "&&": {
                        transform: "rotate(0deg)",
                        transition: "transform 0.25s ease-in-out",

                        "&:hover": {
                            transform: "rotate(46.5deg)",
                        },
                    },
                },
                recommendation: {
                    textDecoration: "underline",
                    transition: "color 0.25s ease-in-out",
                    cursor: "pointer",
                    "&&:hover": {
                        color: objectAccent,
                    },
                },
                accent: {
                    color: "#f88379",
                },
                line: {
                    position: "relative",
                    borderColor: backgroundColor_high,
                    borderTop: "dashed 1px",
                    width: "100%",
                    top: "16px",
                    left: 0,
                    marginBottom: "48px",
                },
            }),
        []
    );

    const [loadedSources, setLoadedSources] = useState<Array<Source>>([]);
    const [sourceManga, setSourceManga] = useState<
        Record<string, Array<Manga>>
    >({});
    useEffect(() => {
        SourceHandler.sourcesArray.forEach((promise) => {
            promise.then((source) => {
                if (loadedSources.find((y) => y.id === source.id)) return false;

                const newSources = [...loadedSources, source];
                MangaDB.get_all(source.id).then((mangas) =>
                    setSourceManga({
                        ...sourceManga,
                        [source.id]: mangas.filter(
                            (manga) => manga.added !== -1
                        ),
                    })
                );

                setLoadedSources(newSources);
            });
        });
    }, [loadedSources]);

    const librarySourceComponentArray = useMemo(() => {
        return loadedSources.map((source) => (
            <LibrarySource
                sourceIcon={source.icon}
                sourceName={source.id}
                key={source.id}
                sourceManga={sourceManga[source.id] ?? []}
            />
        ));
    }, [loadedSources, sourceManga]);

    const [displayRandomize, setDisplayRandomize] = useState(false);
    const randomMangaToUseForNames = useMemo(
        () => [
            "Fuzoroi no Renri",
            "Prunus Girl",
            'A Yuri Story About a Girl Who Insists "It\'s Impossible for Two Girls to Get Together" Completely Falling Within 100 Days',
            "Please Bully Me, Miss Villainess!",
            "I Don't Know Which One Is Love",
            "Beast of Blue Obsidian",
            "Amaesasete Hinamori-san!",
            // "Chikara Aru Succubus wa Seiyoku wo Mitashitai Dake",
        ],
        []
    );

    const [selectedMangaIndex, __setMangaIndex] = useState(
        _.sample(randomMangaToUseForNames)
    );

    const updateRandomManga = useCallback(() => {
        __setMangaIndex(_.sample(randomMangaToUseForNames));
    }, [__setMangaIndex, randomMangaToUseForNames]);

    return (
        <div className={css(styles.library)}>
            <div
                className={css(styles.welcomeContainer)}
                onMouseLeave={() => setDisplayRandomize(false)}
            >
                <div className={css(styles.topStyle)} />
                <motion.div variants={libraryVariants}>
                    <div
                        className={css(
                            styles.welcomeTextContainer,
                            styles.welcomeFieldContainer
                        )}
                    >
                        <h1 className={css(styles.welcomeText)}>
                            Welcome back.
                        </h1>
                    </div>
                    <div
                        className={css(
                            styles.suggestionTextContainer,
                            styles.welcomeFieldContainer
                        )}
                    >
                        <h3 className={css(styles.suggestionText)}>
                            Is it time to read{" "}
                            <span
                                className={css(
                                    styles.recommendation,
                                    styles.accent
                                )}
                                onMouseEnter={() => setDisplayRandomize(true)}
                            >
                                <Tooltip label="Click to continue reading.">
                                    <u>{selectedMangaIndex}</u>
                                </Tooltip>
                            </span>
                            ?
                            {displayRandomize ? (
                                <Tooltip label="Refresh">
                                    <IconButton
                                        aria-label="Randomize"
                                        className={css(styles.randomizeButton)}
                                        icon={
                                            <RepeatIcon
                                                className={css(
                                                    styles.randomizeIcon
                                                )}
                                            />
                                        }
                                        variant="ghost"
                                        onClick={() => {
                                            updateRandomManga();
                                        }}
                                    />
                                </Tooltip>
                            ) : null}
                        </h3>
                    </div>
                </motion.div>
            </div>
            <ButtonGroup
                className={css(styles.libraryButton)}
                variant="solid"
                spacing="32px"
            >
                <LibraryButton aria-label="Settings" icon={<SettingsIcon />} />
                <LibraryButton aria-label="History" icon={<TimeIcon />} />
                <LibraryButton aria-label="Download" icon={<DownloadIcon />} />
                <Link to="/reader?source=MangaDex&manga=0cfadedb-99cf-4fe5-b117-dc624da32225&chapter=2113cf4b-0afd-46fa-8245-3280db357919">
                    <LibraryButton
                        aria-label="[testing] Go to Reader"
                        icon={<InfoIcon />}
                    />
                </Link>
                <Link
                    to={`/view?source=MangaDex&id=e02f32f7-66d6-4eda-818e-a7e4e2c198a1/`}
                >
                    <LibraryButton
                        aria-label="[testing] Go to View"
                        icon={<ViewIcon />}
                    />
                </Link>
                <Link to={`/search`}>
                    <LibraryButton
                        aria-label="Go to Search"
                        icon={<SearchIcon />}
                    />
                </Link>
            </ButtonGroup>
            <hr className={css(styles.line)} />
            {librarySourceComponentArray}
        </div>
    );
};

export default Library;

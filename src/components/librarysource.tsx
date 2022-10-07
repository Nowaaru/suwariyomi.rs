import type { Manga as MangaType } from "types/manga";
import Manga from "components/manga";
import { StyleSheet, css } from "aphrodite";
import { HStack, IconButton, Tooltip } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router";

type LibrarySourceProps = {
    sourceName: string;
    sourceIcon: string;

    sourceManga: MangaType[];
};

const LibrarySource = (props: LibrarySourceProps) => {
    const styles = StyleSheet.create({
        main: {
            display: "flex",
            flexDirection: "column",
            paddingLeft: "8px",
            paddingRight: "8px",
            boxSizing: "border-box",
        },
        meta: {
            display: "flex",
            flexDirection: "row",
            verticalAlign: "center",
        },
        icon: {
            width: "72px",
            height: "72px",
            backgroundColor: "rgb(18, 30, 42)",
            padding: "4px",
            borderRadius: "4px",
            display: "flex",
            justifyContent: "center",
            verticalAlign: "center",
            alignItems: "center",
            flexDirection: "column",
            marginRight: "4px",
        },
        img: {
            maxWidth: "42px",
            maxHeight: "42px",
        },
        name: {
            fontSize: "24px",
        },
        namecontainer: {
            display: "flex",
            flexDirection: "column",
            marginLeft: "8px",
        },
        text: {
            verticalAlign: "middle",
            display: "inline-flex",
            alignItems: "center",
            color: "whitesmoke",
        },
        manga: {
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
            backgroundColor: "rgb(18, 30, 42)",
            width: "100%",
            height: "fit-content",
            minHeight: "250px",
            marginTop: "16px",
            borderRadius: "4px",
            padding: "16px",
            overflow: "hidden",
            justifyContent: "flex-start",
            alignItems: "start",
        },
        mangacount: {
            marginTop: "-4px",
        },
        count: {
            color: "#f88379",
        },
    });

    const Navigate = useNavigate();
    return (
        <div className={css(styles.main)}>
            <div className={css(styles.meta)}>
                <div className={css(styles.icon)}>
                    <img className={css(styles.img)} src={props.sourceIcon} />
                </div>
                <div className={css(styles.namecontainer)}>
                    <HStack>
                        <span className={css(styles.name, styles.text)}>
                            {props.sourceName}
                        </span>
                        <Tooltip label="Click to search using this source.">
                            <IconButton
                                transform="rotate(90deg)"
                                aria-label="Advanced Search"
                                cursor="pointer"
                                backgroundColor="transparent"
                                width="16px"
                                height="16px"
                                padding="0"
                                margin="0"
                                position="relative"
                                top="3px"
                                right="5%"
                                sx={{
                                    color: "#00000044",
                                    transition: "color 1s",
                                    border: "none",
                                    marginLeft: "-28px",
                                    ":hover": {
                                        color: "#fb8e84",
                                        backgroundColor: "transparent",
                                    },
                                }}
                                onClick={() => Navigate("/search")}
                                as={SearchIcon}
                            />
                        </Tooltip>
                    </HStack>
                    <span className={css(styles.text, styles.mangacount)}>
                        <span className={css(styles.count)}>
                            {props.sourceManga.length}&nbsp;
                        </span>
                        Manga
                    </span>
                </div>
            </div>
            <div className={css(styles.manga)}>
                {props.sourceManga.map((manga) => {
                    return (
                        <Manga
                            key={`${manga.source}-${manga.id}`}
                            {...{ manga }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default LibrarySource;

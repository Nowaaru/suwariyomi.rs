import {
    Flex,
    HStack,
    Icon,
    IconButton,
    Progress,
    Skeleton,
    Text,
    Tooltip,
} from "@chakra-ui/react";
import { css, StyleSheet } from "aphrodite";
import Manga from "components/manga";
import { MdOutlineSearchOff } from "react-icons/md";
import type { Manga as MangaType } from "types/manga";

import { SearchIcon, ViewOffIcon } from "@chakra-ui/icons";
import Button from "components/button";
import _ from "lodash";

import { MouseEvent as ReactMouseEvent } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";

export enum Status {
    completed = "completed",
    searching = "searching",
    error = "error",
}

type SearchSourceProps = {
    sourceName: string;
    sourceIcon: string;

    sourceManga: MangaType[];
    maxMangaToShow?: number;
    status?: Status;

    onRetry?: (
        e: ReactMouseEvent<HTMLButtonElement, MouseEvent>,
        sourceToRetryId: string
    ) => void;

    onScopeChange?: (
        e: ReactMouseEvent<HTMLButtonElement, MouseEvent>,
        source: string
    ) => void;
};

const SearchSource = (props: SearchSourceProps) => {
    const {
        sourceName,
        sourceIcon,
        sourceManga,
        maxMangaToShow = 7,

        status = Status.searching,
        onRetry = _.noop,
        onScopeChange = _.noop,
    } = props;
    const styles = StyleSheet.create({
        main: {
            display: "flex",
            flexDirection: "column",
            paddingLeft: "8px",
            paddingRight: "8px",
            boxSizing: "border-box",
            marginTop: "16px",
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
            cursor: "pointer",
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
            flexDirection: "row",
        },
        box: {
            width: "100%",
            height: "fit-content",
            minHeight: "250px",
            marginTop: "16px",
            borderRadius: "4px",
            padding: "16px",
            overflowX: "auto",
            overflowY: "hidden",
            justifyContent: "space-evenly",
            backgroundColor: "rgb(18, 30, 42)",
        },
        mangacount: {
            marginTop: "-4px",
        },
        count: {
            color: "#f88379",
        },

        seeMore: {
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fb8e84",
            borderRadius: "4px 4px 2px 2px",
            marginLeft: "6px",
            width: "200px",
            height: "284px",

            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
        },

        viewOff: {},

        seeMoreText: {
            fontFamily: "Cascadia Code",
            marginTop: "16px",
            color: "white",
        },
    });

    const mangaToShow = sourceManga.slice(0, maxMangaToShow).map((manga) => {
        return (
            <LazyLoadComponent
                placeholder={<Skeleton width="200px" height="360px" />}
                key={`${manga.source}-${manga.id}`}
            >
                <Manga {...{ manga }} />
            </LazyLoadComponent>
        );
    });

    if (maxMangaToShow < sourceManga.length) {
        mangaToShow.push(
            <button
                key={`${sourceName}-showMore`}
                className={css(styles.seeMore)}
            >
                <ViewOffIcon
                    color="#ffffff"
                    width="64px"
                    height="64px"
                    className={css(styles.viewOff)}
                />
                <Text pointerEvents="none" className={css(styles.seeMoreText)}>
                    See More
                </Text>
            </button>
        );
    }

    return (
        <div className={css(styles.main)}>
            <div className={css(styles.meta)}>
                <Tooltip label="Click to search using this source.">
                    <div className={css(styles.icon)}>
                        <img className={css(styles.img)} src={sourceIcon} />
                    </div>
                </Tooltip>
                <div className={css(styles.namecontainer)}>
                    <HStack>
                        <span className={css(styles.name, styles.text)}>
                            {sourceName}
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
                                onClick={(e) => onScopeChange(e, sourceName)}
                                as={SearchIcon}
                            />
                        </Tooltip>
                    </HStack>
                    <span className={css(styles.text, styles.mangacount)}>
                        <span className={css(styles.count)}>
                            {sourceManga.length}&nbsp;
                        </span>
                        Manga
                    </span>
                </div>
            </div>

            {(() => {
                switch (status) {
                    case Status.error:
                        return (
                            <div className={css(styles.box)}>
                                <Flex
                                    direction="column"
                                    justifyContent="center"
                                    alignItems="center"
                                    color="whitesmoke"
                                    fontFamily="Cascadia Code"
                                    minHeight="inherit"
                                >
                                    <HStack
                                        color="white"
                                        fontFamily="Cascadia Code"
                                    >
                                        <Icon
                                            width="32px"
                                            height="32px"
                                            as={MdOutlineSearchOff}
                                            marginRight="4px"
                                        />
                                        <HStack>
                                            <Text lineHeight="32px">
                                                An error occured.
                                            </Text>
                                        </HStack>
                                    </HStack>
                                    <Button
                                        onClick={(e) => onRetry(e, sourceName)}
                                        to={undefined}
                                        size="sm"
                                    >
                                        Retry?
                                    </Button>
                                </Flex>
                            </div>
                        );
                    case Status.searching:
                        return (
                            <div className={css(styles.box)}>
                                <Flex
                                    direction="column"
                                    justifyContent="center"
                                    width="100%"
                                    minHeight="inherit"
                                    alignItems="center"
                                >
                                    <Text
                                        fontFamily="Cascadia Code"
                                        fontSize="12px"
                                        color="whitesmoke"
                                        marginBottom="8px"
                                    >
                                        Searching...
                                    </Text>
                                    <Progress
                                        width="50%"
                                        height="2px"
                                        borderRadius="4px"
                                        isIndeterminate
                                        hasStripe
                                    />
                                </Flex>
                            </div>
                        );
                    case Status.completed:
                    default:
                        if (sourceManga.length > 0)
                            return (
                                <div className={css(styles.box, styles.manga)}>
                                    {mangaToShow}
                                </div>
                            );

                        return (
                            <div className={css(styles.box)}>
                                <Flex
                                    direction="column"
                                    justifyContent="center"
                                    width="100%"
                                    minHeight="inherit"
                                    alignItems="center"
                                >
                                    <ViewOffIcon
                                        width="96px"
                                        height="96px"
                                        marginBottom="6px"
                                        color="whitesmoke"
                                    />
                                    <Text
                                        fontFamily="Cascadia Code"
                                        fontSize="12px"
                                        color="whitesmoke"
                                    >
                                        No Results
                                    </Text>
                                </Flex>
                            </div>
                        );
                }
            })()}
        </div>
    );
};

export default SearchSource;

import { css, StyleSheet } from "aphrodite";
import {
    MutableRefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type { Manga } from "types/manga";
import SourceHandler, { Source } from "util/sources";

import { InfoIcon, SearchIcon } from "@chakra-ui/icons";
import {
    Button,
    ButtonProps,
    Divider,
    Flex,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Skeleton,
    Text,
} from "@chakra-ui/react";

import { MdFilterList } from "react-icons/md";

import SearchSource, { Status } from "components/searchsource";
import _ from "lodash";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateTree } from "util/search";

import BackButton from "components/button";
import MangaComponent from "components/manga";
import useForceUpdate from "hooks/forceupdate";
import { LazyLoadComponent } from "react-lazy-load-image-component";

type Cache = {
    [searchQuery: string]: {
        [sourceId: string]: Array<Manga>;
    };
};

type Search = {
    query: string;
    scope?: string;
    results: Record<
        string,
        {
            status: Status;
            manga: Array<Manga>;
        }
    >;
};

const CardBase = (
    props: {
        className: string;
        children?: JSX.Element | JSX.Element[];
        leftIcon?: JSX.Element;
        rightIcon?: JSX.Element;
        scrollTarget?: MutableRefObject<HTMLElement | undefined | null>;
    } & ButtonProps
) => {
    const {
        className,
        leftIcon = <InfoIcon />,
        rightIcon,
        children = [],
    } = props;

    const [barHidden, setHidden] = useState(false);
    const [{ scrollDelta, scrollPosition }, setDelta] = useState<{
        scrollDelta: number | null;
        scrollPosition: number;
    }>({
        scrollDelta: 0,
        scrollPosition: props.scrollTarget?.current?.scrollTop ?? 0,
    });

    const { current: scrollTarget } = props.scrollTarget ?? {};
    const handleScroll = useCallback(
        _.throttle((oldPosition: number) => {
            if (!scrollTarget) return;

            const newPosition = scrollTarget.scrollTop;
            setDelta({
                scrollDelta: newPosition - oldPosition,
                scrollPosition: newPosition,
            });
        }, 100),
        [scrollTarget]
    );

    useEffect(() => {
        if (!scrollTarget) {
            if (scrollDelta) setDelta({ scrollDelta: null, scrollPosition });
            return;
        }

        const currentScrollPosition = scrollTarget.scrollTop;
        const callHandler = () => handleScroll(currentScrollPosition);

        scrollTarget.addEventListener("scroll", callHandler, { passive: true });

        return () => {
            scrollTarget.removeEventListener("scroll", callHandler);
        };
    }, [handleScroll, scrollTarget, scrollPosition, scrollDelta]);

    const buttonProps = { ...props, scrollTarget: undefined };
    const isAtTop = scrollPosition < (scrollTarget?.clientHeight ?? 1000) * 0.1;

    return (
        <Button
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            top={barHidden ? "-50px" : undefined}
            backgroundColor="#f88379"
            boxShadow={isAtTop ? "none" : "0 0 8px 2px #000000"}
            borderRadius="2px"
            opacity={
                Math.sign(scrollDelta ?? 0) !== 1 ? (isAtTop ? "1" : "0") : "1"
            }
            transition="opacity 0.2s, top 1s, boxShadow 0.2s"
            color="whitesmoke"
            _hover={{
                backgroundColor: "#fb8e84",
            }}
            {...buttonProps}
        >
            {children}
        </Button>
    );
};

const Search = () => {
    const [queryParams] = useSearchParams();
    const forceUpdate = useForceUpdate();
    const Navigate = useNavigate();
    const mainRef = useRef<HTMLDivElement | null | undefined>();

    const styles = useMemo(
        () =>
            StyleSheet.create({
                sources: {},
                search: {
                    backgroundColor: "#0D1620",
                    marginTop: "0px",
                    width: "100vw",
                    height: "100vh",
                    overflowX: "hidden",
                    overflowY: "auto",

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

                searchgroup: {
                    marginTop: "16px",
                },

                searchbar: {
                    color: "white",
                    width: "60% !important",
                    outlineColor: "#00000000",
                },

                hiddenSearchForm: {
                    display: "none",
                },

                sourceHeader: {
                    color: "#fb8e84",
                    textDecoration: "underline",
                    textDecorationColor: "#fb8e8400",
                    cursor: "pointer",
                    ":hover": {
                        textDecorationColor: "#fb8e84",
                    },
                },

                advanced: {
                    padding: "8px",
                },

                mangaContainer: {
                    flexWrap: "wrap",
                    flexDirection: "row",
                    backgroundColor: "rgb(18, 30, 42)",
                    width: "fit-content",
                    height: "fit-content",
                    minHeight: "250px",
                    marginTop: "16px",
                    borderRadius: "4px",
                    padding: "16px",
                    overflow: "hidden",
                    justifyContent: "space-around",
                    alignItems: "start",
                },

                info: {},

                filters: {
                    right: "0",
                },

                top: {
                    position: "sticky",
                },
            }),
        []
    );

    const searchCache = useRef<Cache>({});
    const currentSearch = useRef<Search>({
        query: queryParams.get("search") ?? "",
        results: {},
    });

    const setSearch = useCallback(
        (newValue: ((oldSearch: Search) => Search) | Search) => {
            if (typeof newValue === "function") {
                currentSearch.current = newValue({
                    ...currentSearch.current,
                });
            } else currentSearch.current = newValue as Search;

            Object.keys(currentSearch.current.results).forEach((sourceId) => {
                const currentCache = searchCache.current;
                const currentQuery = currentSearch.current.query;
                const { manga: sourceManga } =
                    currentSearch.current.results[sourceId];

                if (!currentCache[currentQuery])
                    return (currentCache[currentQuery] = {
                        [sourceId]: sourceManga,
                    });

                currentCache[currentQuery][sourceId] = sourceManga;
            });

            return forceUpdate();
        },
        [forceUpdate]
    );

    const trySearch = useCallback(
        async (handler: Source): Promise<Array<Manga>> => {
            return new Promise((resolve, reject) => {
                handler
                    .search(
                        currentSearch.current.query,
                        0,
                        generateTree(SourceHandler.defaultFilters(handler.id))
                    )
                    .then(resolve)
                    .catch(reject);
            });
        },
        []
    );

    useEffect(() => {
        SourceHandler.sourcesArray.forEach(async (sourceHandler) => {
            const handler = await sourceHandler;
            const {
                query: oldQuery,
                scope: oldScope,
                results: oldResults,
            } = currentSearch.current;

            if (oldResults[handler.id]) return;
            if (oldScope && oldScope !== handler.id) return;

            const cachedData = searchCache.current[oldQuery]?.[handler.id];
            setSearch((oldSearch) => {
                const { results } = oldSearch;

                return {
                    ...oldSearch,
                    results: {
                        [handler.id]: cachedData
                            ? { status: Status.completed, manga: cachedData }
                            : {
                                  status: Status.searching,
                                  manga: [],
                              },
                        ...results,
                    },
                };
            });
            if (!cachedData)
                trySearch(handler)
                    .then((searchResults) => {
                        if (oldQuery !== currentSearch.current.query) return;
                        if (oldScope !== currentSearch.current.scope) return;

                        setSearch((oldSearch) => {
                            oldSearch.results[handler.id] = {
                                status: Status.completed,
                                manga: searchResults,
                            };

                            return oldSearch;
                        });
                    })
                    .catch(() => {
                        if (oldQuery !== currentSearch.current.query) return;
                        if (oldScope !== currentSearch.current.scope) return;

                        setSearch((oldSearch) => {
                            oldSearch.results[handler.id] = {
                                status: Status.error,
                                manga: [],
                            };

                            return oldSearch;
                        });
                    });
        });
    });

    const Card = useMemo(() => CardBase, []);

    const searchBar = useRef<HTMLInputElement | null>(null);
    const currentScopedSearch = currentSearch.current.scope
        ? currentSearch.current.results[currentSearch.current.scope]
        : null;

    return (
        <div className={css(styles.search)} ref={(r) => (mainRef.current = r)}>
            <form
                className={css(styles.hiddenSearchForm)}
                id="search"
                onSubmit={(e) => {
                    if (searchBar.current)
                        setSearch((oldSearch) => {
                            oldSearch.results = {};
                            oldSearch.query = (
                                searchBar.current?.value ?? oldSearch.query
                            ).trim();

                            return oldSearch;
                        });

                    e.stopPropagation();
                    e.preventDefault();
                }}
            />
            <HStack padding="8px" spacing="25%" margin="8px">
                <BackButton
                    to={null}
                    onClick={() => {
                        if (!currentSearch.current.scope) Navigate("/library");

                        setSearch((oldSearch) => {
                            oldSearch.scope = undefined;
                            return oldSearch;
                        });
                    }}
                >
                    Back
                </BackButton>
                <InputGroup className={css(styles.searchgroup)}>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="white" />
                    </InputLeftElement>
                    <Input
                        className={css(styles.searchbar)}
                        placeholder="Search here..."
                        form="search"
                        ref={searchBar}
                        defaultValue={currentSearch.current.query}
                    />
                </InputGroup>
            </HStack>
            <Divider borderColor="#00000099" />
            {currentScopedSearch ? (
                <div className={css(styles.advanced)}>
                    <Flex
                        paddingTop="8px"
                        paddingLeft="2.5%"
                        paddingRight="2.5%"
                        justifyContent="space-evenly"
                        top="0"
                        className={css(styles.top)}
                    >
                        <Card
                            className={css(styles.info)}
                            scrollTarget={mainRef}
                            pointerEvents="none"
                        >
                            <Text>Searching: MangaDex</Text>
                        </Card>
                        <Card
                            className={css(styles.filters)}
                            scrollTarget={mainRef}
                        >
                            <HStack>
                                <Text>Filters</Text>
                                <Icon as={MdFilterList} />
                            </HStack>
                        </Card>
                    </Flex>
                    <Flex className={css(styles.mangaContainer)}>
                        {currentScopedSearch.manga
                            .slice(0, 100)
                            .map((manga) => (
                                <LazyLoadComponent
                                    placeholder={
                                        <Skeleton
                                            width="220px"
                                            height="360px"
                                        />
                                    }
                                    key={`${manga.source}-${manga.id}`}
                                >
                                    <MangaComponent manga={manga} />
                                </LazyLoadComponent>
                            ))}
                    </Flex>
                </div>
            ) : (
                <div className={css(styles.sources)}>
                    {Object.keys(currentSearch.current.results ?? {})
                        .map((sourceId) => {
                            const sourceHandler =
                                SourceHandler.getSource(sourceId);
                            if (!sourceHandler) return;

                            const storedManga =
                                currentSearch.current.results[sourceId]
                                    ?.manga ?? [];

                            return (
                                <SearchSource
                                    key={sourceHandler.id}
                                    sourceIcon={sourceHandler.icon}
                                    sourceName={sourceHandler.id}
                                    sourceManga={storedManga}
                                    onScopeChange={(_, id) => {
                                        if (currentSearch.current.scope === id)
                                            return;

                                        console.log("new scope:", id);
                                        setSearch((oldSearch) => {
                                            oldSearch.scope = id;
                                            return oldSearch;
                                        });
                                    }}
                                    onRetry={(_, id) => {
                                        setSearch((oldSearch) => {
                                            oldSearch.results[id].status =
                                                Status.searching;
                                            return oldSearch;
                                        });

                                        trySearch(sourceHandler).then(
                                            (searchResults) => {
                                                setSearch((oldSearch) => {
                                                    const newSearch = {
                                                        ...oldSearch,
                                                    };
                                                    newSearch.results[id] = {
                                                        status: Status.completed,
                                                        manga: searchResults,
                                                    };

                                                    return newSearch;
                                                });
                                            }
                                        );
                                    }}
                                    status={
                                        currentSearch.current.results[sourceId]
                                            ?.status
                                    }
                                />
                            );
                        })
                        .filter((y) => y)}
                </div>
            )}
        </div>
    );
};

export default Search;

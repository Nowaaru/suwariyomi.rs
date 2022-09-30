import { css, StyleSheet } from "aphrodite";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { Manga } from "types/manga";
import SourceHandler, { Source } from "util/sources";

import { SearchIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Text,
} from "@chakra-ui/react";

import { MdFilterList, MdIso } from "react-icons/md";

import SearchSource, { Status } from "components/searchsource";
import { Navigate, useSearchParams } from "react-router-dom";
import { generateTree } from "util/search";

import BackButton from "components/button";
import MangaComponent from "components/manga";
import useForceUpdate from "util/hook/forceupdate";

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

const Search = () => {
    const [queryParams] = useSearchParams();
    const forceUpdate = useForceUpdate();

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
                },

                searchgroup: {
                    marginTop: "16px",
                    marginLeft: "8px",
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

                filters: {},

                footer: {
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

    const searchBar = useRef<HTMLInputElement | null>(null);
    const currentScopedSearch = currentSearch.current.scope
        ? currentSearch.current.results[currentSearch.current.scope]
        : null;

    return (
        <div className={css(styles.search)}>
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
                    onClick={() => {
                        if (!currentSearch.current.scope)
                            Navigate({ to: "/library" });

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
                    <HStack
                        color="whitesmoke"
                        marginTop="16px"
                        marginLeft="5%"
                        fontSize="32px"
                        fontFamily="Cascadia Code"
                    >
                        <Text>Searching:</Text>
                        <Text className={css(styles.sourceHeader)}>
                            {currentSearch.current.scope}
                        </Text>
                    </HStack>
                    <Flex className={css(styles.mangaContainer)}>
                        {currentScopedSearch.manga.slice(0, 15).map((manga) => (
                            <MangaComponent key={manga.id} manga={manga} />
                        ))}
                    </Flex>
                    <Box
                        marginTop="24px"
                        paddingLeft="2.5%"
                        paddingRight="2.5%"
                        bottom="0"
                        paddingBottom="8px"
                        className={css(styles.footer)}
                    >
                        <Button
                            rightIcon={<MdFilterList />}
                            className={css(styles.filters)}
                            backgroundColor="#fb8e84"
                            borderRadius="2px"
                            color="whitesmoke"
                        >
                            <Text marginRight="8px">Filters</Text>
                        </Button>
                    </Box>
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

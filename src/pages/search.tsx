import { css, StyleSheet } from "aphrodite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@chakra-ui/icons";
import {
    Box,
    Divider,
    Flex,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Skeleton,
    SkeletonText,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import Card from "components/card";
import type { Manga } from "types/manga";
import SourceHandler, { Source } from "util/sources";

import { MdFilterList } from "react-icons/md";

import SearchSource, { Status } from "components/searchsource";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateTree } from "util/search";

import BackButton from "components/button";
import MangaComponent from "components/manga";
import useForceUpdate from "hooks/forceupdate";

import CircularProgress from "components/circularprogress";
import Filters from "components/filters";
import InfiniteScroll from "react-infinite-scroll-component";
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

/* BEGIN MODAL IMPORTS */
/* END MODAL IMPORTS */

const Search = () => {
    const {
        isOpen: filtersIsOpen,
        onOpen: onFiltersOpen,
        onClose: onFiltersClose,
    } = useDisclosure();
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
        async (
            handler: Source
        ): Promise<{ total: number; data: Array<Manga> }> => {
            const { query, scope, results } = currentSearch.current;
            return new Promise((resolve, reject) => {
                handler
                    .search(
                        query,
                        scope ? results[scope]?.manga.length : 0,
                        generateTree(
                            scope
                                ? handler.filters
                                : SourceHandler.defaultFilters(handler.id)
                        )
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
            if (filtersIsOpen) return;

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

            const scrollStatus = (loading: boolean) =>
                setScrollStatus((oldStatus) => ({
                    ...oldStatus,
                    loading: loading,
                }));

            if (!cachedData) {
                if (oldScope) scrollStatus(true);
                trySearch(handler)
                    .then((searchResults) => {
                        if (oldQuery !== currentSearch.current.query) return;
                        if (oldScope !== currentSearch.current.scope) return;

                        setSearch((oldSearch) => {
                            oldSearch.results[handler.id] = {
                                status: Status.completed,
                                manga: searchResults.data,
                            };

                            return oldSearch;
                        });
                        scrollStatus(false);
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
                        scrollStatus(false);
                    });
            }
        });
    }, [filtersIsOpen, setSearch, trySearch]);

    const [infiniteScrollStatus, setScrollStatus] = useState({
        loading: false,
        hasMore: true,
    });

    const searchBar = useRef<HTMLInputElement | null>(null);
    const currentScopedSearch = currentSearch.current.scope
        ? currentSearch.current.results[currentSearch.current.scope]
        : null;

    return (
        <div
            className={css(styles.search)}
            id="search"
            ref={(r) => (mainRef.current = r)}
        >
            <form
                className={css(styles.hiddenSearchForm)}
                id="searchbar"
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
            {currentSearch.current.scope ? (
                <Filters
                    handler={SourceHandler.getSource(
                        currentSearch.current.scope
                    )}
                    isOpen={filtersIsOpen}
                    onSubmit={(newFilters) => {
                        if (!currentSearch.current.scope) return;

                        SourceHandler.getSource(
                            currentSearch.current.scope
                        )?.setFilters(newFilters);

                        searchCache.current = {};

                        setSearch((oldSearch) => {
                            oldSearch.results = {};
                            console.log(oldSearch);
                            return oldSearch;
                        });
                    }}
                    onClose={onFiltersClose}
                />
            ) : null}
            <HStack padding="8px" spacing="25%" margin="8px">
                <BackButton
                    onClick={async () => {
                        if (!currentSearch.current.scope) Navigate("/library");
                        await Promise.all(
                            SourceHandler.sourcesArray.map(async (promise) => {
                                const source = await promise;
                                source.setFilters(
                                    SourceHandler.defaultFilters(source.id)
                                );
                            })
                        );

                        setSearch((oldSearch) => {
                            oldSearch.scope = undefined;
                            oldSearch.results = {};
                            searchCache.current = {};
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
                        form="searchbar"
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
                            onClick={onFiltersOpen}
                        >
                            <HStack>
                                <Text>Filters</Text>
                                <Icon as={MdFilterList} />
                            </HStack>
                        </Card>
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
                                                        manga: searchResults.data,
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

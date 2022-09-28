import { css, StyleSheet } from "aphrodite";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { Manga } from "types/manga";
import SourceHandler from "util/sources";

import { SearchIcon } from "@chakra-ui/icons";
import {
    Divider,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
} from "@chakra-ui/react";
import SearchSource from "components/searchsource";
import { useSearchParams } from "react-router-dom";
import { generateTree } from "util/search";

import BackButton from "components/button";
import useForceUpdate from "util/hook/forceupdate";

type Cache = {
    [searchQuery: string]: {
        [sourceId: string]: Array<Manga>;
    };
};

type Search = {
    query: string;
    scope: string | null;
    results: Record<
        string,
        {
            status: "completed" | "error" | "searching";
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
            }),
        []
    );

    const searchCache = useRef<Cache>({});
    const currentSearch = useRef<Search>({
        query: queryParams.get("search") ?? "",
        scope: queryParams.get("scope") ?? null,

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
            if (cachedData)
                console.log("has cached data! not sending request...");

            setSearch((oldSearch) => {
                const { results } = oldSearch;

                return {
                    ...oldSearch,
                    results: {
                        [handler.id]: cachedData
                            ? { status: "completed", manga: cachedData }
                            : {
                                  status: "searching",
                                  manga: [],
                              },
                        ...results,
                    },
                };
            });

            if (!cachedData)
                handler
                    .search(
                        currentSearch.current.query,
                        0,
                        generateTree(SourceHandler.defaultFilters(handler.id))
                    )
                    .then((searchResults) => {
                        if (oldScope !== currentSearch.current.scope) return; // discard stale results
                        if (oldQuery !== currentSearch.current.query) return;

                        setSearch((oldSearch) => {
                            const newSearch = { ...oldSearch };
                            newSearch.results[handler.id] = {
                                status: "completed",
                                manga: searchResults,
                            };

                            return newSearch;
                        });
                    })
                    .catch(console.error);
        });
    });

    const searchBar = useRef<HTMLInputElement | null>(null);

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
                <BackButton />
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
            <div className={css(styles.sources)}>
                {Object.keys(currentSearch.current.results ?? {})
                    .map((sourceId) => {
                        const sourceHandler = SourceHandler.getSource(sourceId);
                        if (!sourceHandler) return;

                        const storedManga =
                            currentSearch.current.results[sourceId]?.manga ??
                            [];

                        return (
                            <SearchSource
                                key={sourceHandler.id}
                                sourceIcon={sourceHandler.icon}
                                sourceName={sourceHandler.id}
                                sourceManga={storedManga}
                            />
                        );
                    })
                    .filter((y) => y)}
            </div>
        </div>
    );
};

export default Search;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, css } from "aphrodite";

import SourceHandler from "util/sources";
import _ from "lodash";
import type { Manga } from "types/manga";

import ipc from "ipc";
import SearchSource from "components/searchsource";
import { SearchFilters } from "types/search";
import { useSearchParams } from "react-router-dom";
import { generateTree } from "util/search";
import {
    Divider,
    FormControl,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

import BackButton from "components/backbutton";
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

    const [searchCache, setSearchCache] = useState<Cache>({});
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

            return forceUpdate();
        },
        [forceUpdate]
    );

    useEffect(() => {
        setSearchCache({});
    }, [currentSearch.current.scope]);

    useEffect(() => {
        SourceHandler.sourcesArray.forEach(async (sourceHandler) => {
            const handler = await sourceHandler;
            const { query: oldQuery, scope: oldScope } = currentSearch.current;

            if (currentSearch.current.results[handler.id]) return;
            if (
                currentSearch.current.scope &&
                currentSearch.current.scope !== handler.id
            )
                return;

            setSearch((oldSearch) => {
                const { results } = oldSearch;

                return {
                    ...oldSearch,
                    results: {
                        [handler.id]: {
                            status: "searching",
                            manga: [],
                        },
                        ...results,
                    },
                };
            });

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
                        onSubmit={() => console.log("ya")}
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

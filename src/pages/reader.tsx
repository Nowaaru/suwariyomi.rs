import MangaPage from "components/mangapage";
import Lightbar from "components/lightbar";
import { StyleSheet, css } from "aphrodite";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import _ from "lodash";
import SourceHandler, { Source } from "util/sources";
import CircularProgress from "components/circularprogress";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type Page = {
    url: string;
    blob: Blob;

    didError: boolean;
    isDownloading: boolean;
    completed: boolean;

    contentSize: number;
};

type MangaData = {
    mangaId: string | null;
    sourceId: string | null;
    chapterId: string | null;
};

const Reader = () => {
    const futurePagesToLoad = 4;
    const Navigate = useNavigate();
    const [pageSources, setPageSources] = useState<Array<string>>([]);
    const pages = useRef<Array<Page>>([]);

    const [queryParams] = useSearchParams();
    const [sourceHandler, setSourceHandler] = useState<Source | null>(null);
    const [mangaData] = useState<MangaData>({
        mangaId: queryParams.get("manga"),
        sourceId: queryParams.get("source"),
        chapterId: queryParams.get("chapter"),
    });

    const [currentPage, setCurrentPage] = useState<Page | null>(null);
    const setPage = useCallback(
        (oneBasedPageIndex: number) => {
            setCurrentPage(
                pages.current[
                    _.clamp(oneBasedPageIndex - 1, 0, pages.current.length - 1)
                ]
            );
        },
        [setCurrentPage, pages]
    );

    const currentPageNumber: number | null = useMemo<number | null>(() => {
        const foundPage: number = pages.current.findIndex(
            (x) => x.url === currentPage?.url
        );
        return foundPage === -1 ? null : foundPage + 1;
    }, [pages, currentPage]);

    useEffect(() => {
        if (!currentPageNumber) return;
        const onKeyPress = (e: KeyboardEvent) => {
            const { code } = e;
            const codeMaps: Record<string, number> = {
                ArrowRight: 1,
                ArrowLeft: -1,
                D: 1,
                A: -1,
                PageDown: 1,
                PageUp: -1,
                ArrowDown: 1,
                ArrowUp: -1,
            };

            if (code === "Backspace")
                return Navigate(`/view?source=${mangaData.sourceId}&id=${mangaData.mangaId}`);

            if (codeMaps[code]) {
                const y =
                    pages.current[
                        _.clamp(
                            currentPageNumber - 1 + codeMaps[code],
                            0,
                            pages.current.length - 1
                        )
                    ];
                setCurrentPage(y);
            }
        };

        window.addEventListener("keydown", onKeyPress);
        return () => window.removeEventListener("keydown", onKeyPress);
    });

    useEffect(() => {
        if (!mangaData.sourceId) return;
        SourceHandler.querySource(mangaData.sourceId).then((foundSource) =>
            setSourceHandler(foundSource ?? null)
        );
    }, [mangaData]);

    useEffect(() => {
        if (!sourceHandler || !mangaData.chapterId || !mangaData.mangaId)
            return;

        sourceHandler
            .getPages(mangaData.mangaId, mangaData.chapterId)
            .then((newPagesArray) => {
                console.log(newPagesArray);
                setPageSources(newPagesArray);
                pages.current = newPagesArray.map((n) => ({
                    url: n,
                    blob: new Blob(),

                    didError: false,
                    isDownloading: false,
                    completed: false,

                    contentSize: -1,
                }));

                setCurrentPage(pages.current[0]);
            });
    }, [mangaData, sourceHandler]);

    useEffect(() => {
        if (!currentPageNumber) return;
        const pagesToLoad = pageSources.slice(
            0,
            currentPageNumber + futurePagesToLoad - 1
        );

        pagesToLoad.forEach((page) => {
            const foundPageIndex = pages.current.findIndex(
                ({ url }) => url === page
            );

            const associatedPageObject = {
                ...(pages.current.find(({ url }) => url === page) ?? {}),
            };

            if (
                !associatedPageObject ||
                _.isEmpty(associatedPageObject) ||
                associatedPageObject?.completed ||
                associatedPageObject?.isDownloading
            )
                return;

            const setError = () =>
                (pages.current[foundPageIndex] = Object.assign(
                    associatedPageObject,
                    {
                        didError: true,
                        completed: false,
                        isDownloading: false,
                        contentSize: -1,
                    }
                ) as Page);

            pages.current[foundPageIndex] = Object.assign(
                associatedPageObject,
                { isDownloading: true }
            ) as Page;

            console.log(`now loading: ${page}`);
            fetch(page, {
                method: "GET",
                responseType: ResponseType.Binary,
                timeout: 10,
            }).then((response) => {
                if (!response.ok) setError();
                console.log(`done loading: ${page}`);
                const newBlob = new Blob( // SHOUTOUTS TO TAURI APPS' MELLENIO AND GIBBY FOR THEIR HELP
                    [new Uint8Array(response.data as Array<number>)],
                    { type: response.headers["content-type"] }
                );

                pages.current[foundPageIndex] = Object.assign(
                    associatedPageObject,
                    {
                        blob: newBlob,
                        contentSize: response.headers["content-length"],
                        isDownloading: false,
                        completed: true,
                    }
                ) as Page;

                if (associatedPageObject.url === currentPage?.url) {
                    setCurrentPage(associatedPageObject as Page);
                }
            });
        });
    }, [pageSources, currentPage?.url, currentPageNumber]);

    const currentMangaPage = useMemo(() => {
        if (!currentPageNumber) return;
        if (!currentPage?.completed && !currentPage?.didError)
            return (
                <div
                    style={{
                        width: "100vw",
                        height: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        verticalAlign: "middle",
                    }}
                >
                    <CircularProgress display="flex" />
                </div>
            );

        return (
            <MangaPage
                fit="comfortable"
                blob={currentPage?.blob ?? new Blob()}
            />
        );
    }, [currentPageNumber, currentPage]);

    const styles = StyleSheet.create({
        reader: {
            backgroundColor: "#0D1620",
            width: "100vw",
            height: "100vh",
        },
    });

    return (
        <div className={css(styles.reader)}>
            {currentMangaPage}
            {pages.current.length > 0 && currentPageNumber ? (
                <Lightbar
                    onTabClick={(_, tab) => {
                        if (tab === currentPageNumber) return;
                        setPage(tab);
                    }}
                    pages={pages.current.length ?? 1}
                    current={currentPageNumber}
                />
            ) : null}
        </div>
    );
};

export default Reader;

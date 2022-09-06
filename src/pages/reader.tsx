import MangaPage from "components/mangapage";
import Lightbar from "components/lightbar";
import { CircularProgress } from "@chakra-ui/react";
import { StyleSheet, css } from "aphrodite";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import _ from "lodash";

const test_getPages = () => {
    const arr = [];
    for (let i = 1; i < 8; i++)
        arr.push(`http://localhost:3000/?file=${i}.png`);

    return arr;
};

type Page = {
    url: string;
    blob: Blob;

    didError: boolean;
    isDownloading: boolean;
    completed: boolean;

    contentSize: number;
};

type MangaData = {
    mangaId: string;
    sourceId: string;
    chapterId: string;
};

const MangaPageTest = () => {
    const futurePagesToLoad = 4;
    const [pageSources, setPageSources] = useState<Array<string>>([]);
    const pages = useRef<Array<Page>>([]);
    const [mangaData, setMangaData] = useState<MangaData>({
        mangaId: "pissballs",
        sourceId: "cockdick",
        chapterId: "0000-0000-0000",
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
        setPageSources(test_getPages());
        pages.current = test_getPages().map((n) => ({
            url: n,
            blob: new Blob(),

            didError: false,
            isDownloading: false,
            completed: false,

            contentSize: -1,
        }));

        setCurrentPage(pages.current[0]);
    }, [mangaData]);

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
                pages.current[foundPageIndex] = Object.assign(associatedPageObject, {
                    didError: true,
                    completed: false,
                    isDownloading: false,
                    contentSize: -1,
                }) as Page;

            pages.current[foundPageIndex] = Object.assign(associatedPageObject, { isDownloading: true }) as Page;
            fetch(page, {
                method: "GET",
                responseType: ResponseType.Binary,
                timeout: 10,
            }).then((response) => {
                if (!response.ok) setError();
                const newBlob = new Blob( // SHOUTOUTS TO TAURI APPS' MELLENIO AND GIBBY FOR THEIR HELP
                    [new Uint8Array(response.data as Array<number>)],
                    { type: response.headers["content-type"] }
                );

                pages.current[foundPageIndex] = Object.assign(associatedPageObject, {
                    blob: newBlob,
                    contentSize: response.headers["content-length"],
                    isDownloading: false,
                    completed: true,
                }) as Page;

                if (associatedPageObject.url === currentPage?.url) {
                    setCurrentPage(associatedPageObject as Page);
                }
            });
        });
    }, [pageSources, currentPage?.url, currentPageNumber]);

    const currentMangaPage = useMemo(() => {
        if (!currentPageNumber) return;

        return (
            <MangaPage
                fit="comfortable"
                blob={currentPage?.blob ?? new Blob()}
            />
        );
    }, [currentPageNumber, currentPage]);

    const styles = StyleSheet.create({
        reader: {},
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

export default MangaPageTest;

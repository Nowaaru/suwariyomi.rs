import {
    Button,
    ButtonGroup,
    Container,
    IconButton,
    Tooltip,
    IconButtonProps,
    Divider,
    useDisclosure,
} from "@chakra-ui/react";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import { open } from "@tauri-apps/api/shell";
import { css, StyleSheet } from "aphrodite";
import CircularProgress from "components/circularprogress";
import Lightbar from "components/lightbar";
import MangaPage, { FilterType } from "components/mangapage";
import Chapters from "components/chapters";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    MdFormatListNumbered,
    MdHouse,
    MdLooksOne,
    MdPublic,
    MdSettings,
    MdShare,
} from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";
import SourceHandler, { Source } from "util/sources";
import { Chapter } from "types/manga";
import chroma from "chroma-js";

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

    chapters: Array<Chapter> | null;
};

// Batch type is less intensive, but slower.
// Individually is faster, but updates state more - therefore laggier. :thumbsup:
enum PageLoadType {
    Batch = 1,
    Individually = 2,
}

const IconButtonWithLabel = (
    props: {
        label: string;
        color?: string;
    } & Partial<IconButtonProps>
) => {
    const newProps: {
        [K in keyof typeof props]?: IconButtonProps[keyof IconButtonProps];
    } & { ["aria-label"]: string } = {
        ["aria-label"]: props.label,
    };

    (Object.keys(props) as Array<keyof typeof props>).forEach(
        (k) => (newProps[k] = props[k])
    );

    return (
        <Tooltip label={props.label} hasArrow>
            <IconButton
                _hover={{
                    backgroundColor: props.color ?? "#f88379",
                }}
                variant="ghost"
                {...newProps}
            />
        </Tooltip>
    );
};

const Reader = () => {
    const futurePagesToLoad = 4;
    const Navigate = useNavigate();
    const pageLoadType: PageLoadType = useMemo<PageLoadType>(
        () => PageLoadType.Batch,
        []
    );

    const styles = StyleSheet.create({
        reader: {
            backgroundColor: "#0D1620",
            width: "100vw",
            height: "100vh",
        },
    });

    const [queryParams, setQueryParams] = useSearchParams();
    const [sourceHandler, setSourceHandler] = useState<Source | null>(null);
    const [mangaData, updateMangaData] = useState<MangaData>({
        mangaId: queryParams.get("manga"),
        sourceId: queryParams.get("source"),
        chapterId: queryParams.get("chapter"),

        chapters: null,
    });

    const [pages, setPages] = useState<Array<Page> | null>(null);
    const [displayIntermediary, setIntermediary] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page | null>(null);

    const setPage = useCallback(
        (oneBasedPageIndex: number) => {
            if (!pages) return;
            setCurrentPage(
                pages[_.clamp(oneBasedPageIndex - 1, 0, pages.length - 1)]
            );
        },
        [setCurrentPage, pages]
    );

    const currentPageNumber: number | null = useMemo<number | null>(() => {
        const foundPage: number =
            pages?.findIndex((x) => x.url === currentPage?.url) ?? -1;

        return foundPage === -1 ? null : foundPage + 1;
    }, [pages, currentPage]);

    const {
        isOpen: chaptersAreOpen,
        onOpen: onChaptersOpen,
        onClose: onChaptersClose,
    } = useDisclosure();

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

            if (code === "Backspace") return Navigate(-1);

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
        if (!sourceHandler || !mangaData.mangaId || mangaData.chapters) return;

        getAllChapters(sourceHandler, mangaData.mangaId).then((chapters) =>
            updateMangaData({ ...mangaData, chapters })
        );
    }, [sourceHandler, mangaData]);






            );



    const downloadPage = useCallback(async (page: Page): Promise<Page> => {
        return fetch(page.url, {
            method: "GET",
            responseType: ResponseType.Binary,
            timeout: 10,
        })
            .then(async (response) => {
                if (!response.ok)
                    return {
                        ...page,
                        didError: true,
                        completed: false,
                        isDownloading: false,
                    };

                const blob = new Blob( // SHOUTOUTS TO TAURI APPS' MELLENIO AND GIBBY FOR THEIR HELP
                    [new Uint8Array(response.data as Array<number>)],
                    { type: response.headers["content-type"] }
                );
                return {
                    ...page,
                    didError: false,
                    completed: true,
                    isDownloading: false,

                    contentSize: Number(response.headers["content-length"]),
                    bitmap: await createImageBitmap(blob),
                    blob: blob,
                } as Page;
            })
            .catch((err) => {
                const erroringPage = pages?.findIndex(
                    (z) => z.url === page.url
                );
                console.error(
                    `An error occurred trying to download Page ${
                        erroringPage ? erroringPage + 1 : "<unknown>"
                    }:\n${err}`
                );
                return {
                    ...page,
                    didError: true,
                    completed: false,
                    isDownloading: false,
                };
            });
    }, []);

    const [loadingQueue, setLoadingQueue] = useState<Array<Page>>([]);
    const loadingQueueOnFinishedHandler = useCallback(
        (pages: Array<Page>) =>
            setPages((oldPages) => {
                if (!oldPages) return null;

                const newPages = [...oldPages].map(
                    (n) => pages.find((y) => y.url === n.url) ?? n
                );

                const newCurrentPage = newPages.find(
                    (p) => p.url === currentPage?.url
                );

                console.log("Inputted pages:", pages);
                if (newCurrentPage) setCurrentPage(newCurrentPage);
                return newPages;
            }),
        [currentPage?.url]
    );

    useEffect(() => {
        if (!currentPage || !currentPageNumber) return;
        const pagesToLoad = pages
            ?.slice(
                Math.max(currentPageNumber - 1, 0),
                currentPageNumber + (futurePagesToLoad - 1)
            )
            .filter((y) => !y.isDownloading && !y.completed && !y.didError); // do not redownload pages

        if (pagesToLoad && pagesToLoad.length > 0)
            setLoadingQueue((loadingQueue) => [
                ...loadingQueue,
                ...pagesToLoad,
            ]);
    }, [currentPage, currentPageNumber, pages]);

    useEffect(() => {
        if (loadingQueue.length === 0) return;

        setLoadingQueue((loadingQueue) => {
            const pagesToBeLoaded = loadingQueue.splice(0, futurePagesToLoad);

            setPages((oldPages) => {
                if (!oldPages) return null;
                pagesToBeLoaded.forEach((p) => {
                    const maybePage = oldPages?.find((u) => u.url == p.url);
                    if (maybePage) maybePage.isDownloading = true;
                });

                return [...oldPages];
            });

            // encouraging bad coding practices #5,000,296
            const downloadedPages = pagesToBeLoaded.map(downloadPage);
            if (pageLoadType === PageLoadType.Batch)
                Promise.all(downloadedPages).then(
                    loadingQueueOnFinishedHandler
                );
            else
                downloadedPages.forEach(async (p) =>
                    p.then((q) => loadingQueueOnFinishedHandler([q]))
                );

            return loadingQueue;
        });
    }, [
        loadingQueue,
        downloadPage,
        currentPage,
        loadingQueueOnFinishedHandler,
        pageLoadType,
    ]);

    useEffect(() => {
        if (!mangaData || !mangaData.mangaId || !mangaData.chapterId) return;
        if (!sourceHandler) return;
        if (pages) return;

        sourceHandler
            .getPages(mangaData?.mangaId, mangaData?.chapterId)
            .then((allPages) => {
                const newPages = allPages.map((pageUrl) => ({
                    url: pageUrl,
                    blob: new Blob(),

                    didError: false,
                    isDownloading: false,
                    completed: false,

                    contentSize: -1,
                }));

                setPages(newPages);
                setCurrentPage(newPages[0]);
            });
    }, [pages, mangaData, sourceHandler]);

    const currentMangaPage = useMemo(() => {
        if (!currentPageNumber) return;
        if (!currentPage?.completed || currentPage?.didError) {
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
                    {currentPage?.didError ? (
                        <Button
                            display="flex"
                            disabled={!!currentPage}
                            onClick={() => {
                                if (!currentPage) return;
                                downloadPage(currentPage).then(
                                    (downloadedPage) =>
                                        setPages((oldPages) => {
                                            const newPages = _.cloneDeep(
                                                oldPages as Page[]
                                            );

                                            newPages[currentPageNumber - 1] =
                                                downloadedPage;
                                            if (
                                                currentPage.url ===
                                                downloadedPage.url
                                            )
                                                setCurrentPage(downloadedPage);

                                            return newPages;
                                        })
                                );
                            }}
                        >
                            Retry
                        </Button>
                    ) : (
                        <CircularProgress display="flex" />
                    )}
                </div>
            );
        }

        return <MangaPage fit="comfortable" bitmap={currentPage.bitmap} />;
    }, [currentPageNumber, downloadPage, currentPage]);

    const lastMovedFadeThreshold = 1000;
    const [forceShow, setForceShow] = useState(false);
    const [mouseData, _setMouseData] = useState({
        x: 0,
        y: 0,

        lastMoved: 0,
    });

    const setMouseData = useCallback(_.throttle(_setMouseData, 350), [
        _setMouseData,
    ]);
    useEffect(() => {
        const newInterval = setInterval(() => {
            setMouseData((oldData) =>
                oldData.lastMoved >= lastMovedFadeThreshold
                    ? oldData
                    : {
                          ...oldData,
                          lastMoved: _.clamp(
                              oldData.lastMoved + 500,
                              0,
                              lastMovedFadeThreshold
                          ),
                      }
            );
        }, 500);

        return () => clearInterval(newInterval);
    }, [setMouseData]);

    const shouldHide =
        lastMovedFadeThreshold < mouseData.lastMoved && !forceShow;

    return (
        <div
            className={css(styles.reader)}
            onMouseMove={({ clientX: x, clientY: y }) =>
                setMouseData({ x, y, lastMoved: 0 })
            }
        >
            {mangaData.chapters ? (
                <Chapters
                    onChapterSelect={(chapterId) => {
                        updateMangaData((oldMangaData) => ({
                            ...oldMangaData,
                            chapterId,
                            chapters: null,
                        }));

                        const newParams = new URLSearchParams(queryParams);
                        newParams.set("chapter", chapterId);

                        setQueryParams(newParams);
                        setCurrentPage(null);
                    }}
                    chapters={mangaData.chapters}
                    isOpen={chaptersAreOpen}
                    onClose={onChaptersClose}
                />
            ) : null}
            {currentMangaPage}
            <Container
                position="absolute"
                maxWidth="100%"
                height="100px"
                bottom="50px"
                centerContent
            >
                <Container
                    backgroundColor={forceShow ? "#0D1620" : "#0D1620CC"}
                    borderColor="#00000044"
                    borderWidth="2px"
                    borderRadius="4px"
                    padding="8px"
                    color="white"
                    maxWidth="450px"
                    width="fit-content"
                    height="fit-content"
                    maxHeight="100%"
                    display={shouldHide ? "none" : "initial"}
                    onMouseEnter={() => setForceShow(true)}
                    onMouseLeave={() => setForceShow(false)}
                >
                    <ButtonGroup height="100%">
                        <IconButtonWithLabel
                            label="Go Back"
                            onClick={() => Navigate(-1)}
                            icon={<MdHouse />}
                        />
                        <IconButtonWithLabel
                            label="Open Settings"
                            onClick={() => Navigate(-1)}
                            icon={<MdSettings />}
                        />
                        <Divider orientation="vertical" />
                        <IconButtonWithLabel
                            icon={<MdPublic />}
                            onClick={() => {
                                if (mangaData.chapterId && mangaData.mangaId) {
                                    const chapterUrl =
                                        sourceHandler?.getChapterUrl?.(
                                            mangaData.mangaId,
                                            mangaData.chapterId,
                                            currentPageNumber
                                        );

                                    if (chapterUrl) open(chapterUrl);
                                }
                            }}
                            label="Open in Browser"
                        />
                        <IconButtonWithLabel
                            icon={<MdLooksOne />}
                            label="Single Page"
                        />
                        <IconButtonWithLabel icon={<MdShare />} label="Share" />
                        <IconButtonWithLabel
                            label="Open Chapter Index"
                            onClick={onChaptersOpen}
                            icon={<MdFormatListNumbered />}
                        />
                    </ButtonGroup>
                </Container>
            </Container>
            {pages && pages.length > 0 && currentPageNumber ? (
                <Lightbar
                    onTabClick={(_, tab) => {
                        if (tab === currentPageNumber) return;
                        setPage(tab);
                    }}
                    pages={pages.length ?? 1}
                    current={currentPageNumber}
                />
            ) : null}
        </div>
    );
};

export default Reader;

import { ArrowBackIcon, SearchIcon } from "@chakra-ui/icons";
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
import MangaPage from "components/mangapage";
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
    const [pageSources, setPageSources] = useState<Array<string>>([]);
    const pages = useRef<Array<Page>>([]);

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

        sourceHandler.getChapters(mangaData.mangaId).then((chapters) =>
            updateMangaData((oldMangaData) => ({
                ...oldMangaData,
                chapters,
            }))
        );
    }, [sourceHandler, mangaData]);

    useEffect(() => {
        if (!sourceHandler || !mangaData.chapterId || !mangaData.mangaId || pageSources?.length > 0)
            return;

        sourceHandler
            .getPages(mangaData.mangaId, mangaData.chapterId)
            .then((newPagesArray) => {
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
    }, [mangaData, sourceHandler, pageSources?.length]);

    const downloadPage = useCallback(
        ({ pageUrl: page }: { pageUrl: string }) => {
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

            fetch(page, {
                method: "GET",
                responseType: ResponseType.Binary,
                timeout: 10,
            })
                .then((response) => {
                    if (!response.ok) setError();
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
                })
                .catch((error) => {
                    const erroredPage = Object.assign(associatedPageObject, {
                        isDownloading: false,
                        completed: false,
                        didError: true,
                    }) as Page;

                    pages.current[foundPageIndex] = erroredPage;
                    setCurrentPage(erroredPage);

                    console.error(error);
                });
        },
        [currentPage?.url]
    );

    useEffect(() => {
        if (!currentPageNumber) return;
        const pagesToLoad = pageSources.slice(
            0,
            currentPageNumber + futurePagesToLoad - 1
        );

        pagesToLoad.forEach((pageUrl) => downloadPage({ pageUrl }));
    }, [pageSources, currentPageNumber, downloadPage]);

    const currentMangaPage = useMemo(() => {
        if (!currentPageNumber) return;
        if (!currentPage?.completed && !currentPage?.didError) {
            const currentPage = pages.current[currentPageNumber - 1];
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
                                downloadPage({ pageUrl: currentPage.url });
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
        return (
            <MangaPage
                fit="comfortable"
                blob={currentPage?.blob ?? new Blob()}
            />
        );
    }, [currentPageNumber, downloadPage, currentPage]);

    const lastMovedFadeThreshold = 1000;
    const [forceShow, setForceShow] = useState(false);
    const [mouseData, setMouseData] = useState({
        x: 0,
        y: 0,

        lastMoved: 0,
    });

    useEffect(() => {
        const newInterval = setInterval(
            () =>
                setMouseData((oldData) => ({
                    ...oldData,
                    lastMoved: oldData.lastMoved + 100,
                })),
            100
        );
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
                        setPageSources([]);
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

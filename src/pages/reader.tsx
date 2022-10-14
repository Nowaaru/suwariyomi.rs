import {
    Button,
    ButtonGroup,
    Container,
    Divider,
    Flex,
    IconButton,
    IconButtonProps,
    Text,
    Tooltip,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import { open } from "@tauri-apps/api/shell";
import { css, StyleSheet } from "aphrodite";
import Chapters from "components/chapters";
import CircularProgress from "components/circularprogress";
import Lightbar from "components/lightbar";
import MangaPage from "components/mangapage";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    MdFormatListNumbered,
    MdHome,
    MdHouse,
    MdLooksOne,
    MdPublic,
    MdSettings,
    MdShare,
} from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Chapter } from "types/manga";
import SourceHandler, { getAllChapters, Source } from "util/sources";
import { compileChapterTitle } from "util/textutil";

type Page = {
    url: string;
    blob: Blob;
    bitmap?: ImageBitmap;

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

enum PageAnimationType {
    None = 1,
    Slide = 2
}

const IconButtonWithLabel = (
    props: {
        label: string;
        hasArrow?: boolean;
        color?: string;
    } & Partial<IconButtonProps>
) => {
    const newProps: {
        [K in keyof typeof props]?: IconButtonProps[keyof IconButtonProps];
    } & { ["aria-label"]: string } = {
        ["aria-label"]: props.label,
    };

    (
        Object.keys(_.omit(props, "hasArrow")) as Array<keyof typeof props>
    ).forEach((k) => (newProps[k] = props[k]));

    return (
        <Tooltip label={props.label} hasArrow={props.hasArrow}>
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
        () => PageLoadType.Individually,
        []
    );

    const styles = StyleSheet.create({
        reader: {
            backgroundColor: "#0D1620",
            width: "100vw",
            height: "100vh",
        },

        spoiled: {
            color: "#FA4F4F",
            fontWeight: "bold",
        },

        chaptertitle: {
            color: "whitesmoke",
        },

        chapter: {
            color: "#f88379",
            fontWeight: "bolder",
        },

        title: {},
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
    const [currentPageNumber, setCurrentPageNumber] = useState<number | null>(
        null
    );
    const currentPage = useMemo(
        () => (currentPageNumber ? pages?.[currentPageNumber - 1] : null),
        [currentPageNumber, pages]
    );

    const setChapter = useCallback(
        (chapterId: string) => {
            updateMangaData((oldMangaData) => ({
                ...oldMangaData,
                chapterId,
            }));

            const newParams = new URLSearchParams(queryParams);
            newParams.set("chapter", chapterId);

            setQueryParams(newParams);
            setIntermediary(false);
            setPages(null);
            setCurrentPageNumber(null);
        },
        [queryParams, setQueryParams]
    );

    const handleIntermediary = useCallback(
        (dir: 1 | -1) => {
            if (!pages) return false;
            if (!currentPageNumber) return false;
            if (!mangaData) return false;
            if (!mangaData.chapters) return false;
            if (!mangaData.chapterId) return false;

            const directionsDiffer =
                (dir === 1 && currentPageNumber !== pages.length) ||
                (dir === -1 && currentPageNumber !== 1);
            if ([1, pages.length].includes(currentPageNumber)) {
                if (!displayIntermediary) {
                    if (directionsDiffer) return false;

                    setIntermediary(true);
                    return true;
                }

                const currentChapterIdx =
                    mangaData.chapters.findIndex(
                        (ch) => ch.id === mangaData.chapterId
                    ) ?? -1;

                const nextChapter = mangaData.chapters[currentChapterIdx + 1];
                const previousChapter =
                    mangaData.chapters[currentChapterIdx - 1];

                // Check if they're going the opposite direction of what
                // is signified by currentPageNumber. If so, turn off
                // setIntermediary
                if (directionsDiffer) {
                    setIntermediary(false);
                } else {
                    if (dir === 1 && nextChapter) setChapter(nextChapter.id);
                    if (dir === -1 && previousChapter)
                        setChapter(previousChapter.id);
                }

                return true;
            }
            return false;
        },
        [setChapter, currentPageNumber, displayIntermediary, mangaData, pages]
    );

    const incrementPage = useCallback(() => {
        if (!currentPageNumber) return;
        if (handleIntermediary(1)) return;
        setCurrentPageNumber(currentPageNumber + 1);
    }, [currentPageNumber, handleIntermediary]);

    const decrementPage = useCallback(() => {
        if (!currentPageNumber) return;
        if (handleIntermediary(-1)) return;
        setCurrentPageNumber(currentPageNumber - 1);
    }, [currentPageNumber, handleIntermediary]);

    const {
        isOpen: chaptersAreOpen,
        onOpen: onChaptersOpen,
        onClose: onChaptersClose,
    } = useDisclosure();

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

    const intermediaryContainer = useMemo(() => {
        if (!mangaData.chapters) return;
        const currentChapterIdx = mangaData.chapters.findIndex(
            (ch) => ch.id === mangaData.chapterId
        );

        const isGoingBack = (currentPageNumber ?? 0) <= 1;
        const headerOne = isGoingBack ? "Previous" : "Finished";
        const headerTwo = isGoingBack ? "Current" : "Next";

        const chapterFactor = currentChapterIdx + (isGoingBack ? -1 : 1);
        const targetChapter =
            mangaData.chapters[
                _.clamp(chapterFactor, 0, mangaData.chapters.length)
            ];
        const currentChapter = mangaData.chapters[currentChapterIdx];

        const skippedSubchapters = // This will probably flag incorrectly due to floating point errors
            Math.round(
                ((targetChapter.chapter % 1) - (currentChapter.chapter % 1)) *
                    10
            );

        const skippedChapters = Math.floor(
            targetChapter.chapter - currentChapter.chapter
        );

        const subchaptersAreSkipped =
            skippedSubchapters > 1 && skippedSubchapters !== 5 ? (
                // 5 is likely to indicate a half-chapter
                <VStack>
                    <Text fontSize="12px" marginTop="20px">
                        ⚠️ {skippedSubchapters} sub-chapter
                        {skippedSubchapters > 1 ? `s` : ""} are missing. If you
                        continue, you may be{" "}
                        <span className={css(styles.spoiled)}>spoiled</span>.
                    </Text>
                    <IconButtonWithLabel
                        icon={<MdHome />}
                        _hover={{
                            color: "#f88379",
                            transform: "scaleX(1.05) scaleY(1.05)",
                        }}
                        _active={{ transform: "scaleX(1.2) scaleY(1.2)" }}
                        onClick={() => Navigate(-1)}
                        hasArrow={false}
                        label="Go Back"
                    />
                </VStack>
            ) : null;

        const chaptersAreSkipped =
            skippedChapters > 1 ? (
                <VStack>
                    <Text fontSize="12px" marginTop="20px">
                        ⚠️ {skippedChapters} chapter
                        {skippedChapters > 1 ? `s` : ""} are missing. If you
                        continue, you may be{" "}
                        <span className={css(styles.spoiled)}>spoiled</span>.
                    </Text>
                    <IconButtonWithLabel
                        icon={<MdHome />}
                        _hover={{
                            color: "#f88379",
                            transform: "scaleX(1.05) scaleY(1.05)",
                        }}
                        _active={{ transform: "scaleX(1.2) scaleY(1.2)" }}
                        onClick={() => Navigate(-1)}
                        hasArrow={false}
                        label="Go Back"
                    />
                </VStack>
            ) : null;

        if (targetChapter && currentChapter) {
            const generateChapterTitle = (ch = currentChapter) => (
                <span className={css(styles.chaptertitle)}>
                    <span className={css(styles.chapter)} color="#f88379">
                        {compileChapterTitle(ch, true, true)}
                    </span>
                    {ch.title ? (
                        <span className={css(styles.title)}> | {ch.title}</span>
                    ) : null}
                </span>
            );

            const currentChapterTitle = generateChapterTitle(currentChapter);
            const targetChapterTitle = generateChapterTitle(targetChapter);

            const dataWhenTargetChapterIsPresent = (
                <>
                    <VStack align="start" width="100%" gap={0}>
                        <Text fontWeight="bolder">{headerOne}:</Text>
                        <Text color="#f88379" lineHeight="1px">
                            {isGoingBack
                                ? targetChapterTitle
                                : currentChapterTitle}
                        </Text>
                    </VStack>
                    <VStack align="start" paddingTop="9px" gap={0}>
                        <Text fontWeight="bold">{headerTwo}:</Text>
                        <Text color="#f88379" lineHeight="1px">
                            {isGoingBack
                                ? currentChapterTitle
                                : targetChapterTitle}
                        </Text>
                    </VStack>
                    {chaptersAreSkipped ?? subchaptersAreSkipped}
                </>
            );

            const dataWhenTargetChapterIsNotPresent = (
                <Text alignSelf="center">
                    There is no {isGoingBack ? "previous" : "next"} chapter.
                </Text>
            );

            return (
                <Flex
                    justifyContent="center"
                    alignItems="center"
                    width="100vw"
                    height="100vh"
                    color="whitesmoke"
                    boxSizing="border-box"
                    backgroundColor="#000000AA"
                >
                    <Flex
                        borderRadius="4px"
                        minWidth="400px"
                        minHeight="300px"
                        justify="center"
                        alignItems="center"
                        padding="16px"
                    >
                        <VStack align="start" width="100%" gap={4}>
                            {targetChapter.id === currentChapter.id
                                ? dataWhenTargetChapterIsNotPresent
                                : dataWhenTargetChapterIsPresent}
                        </VStack>
                    </Flex>
                </Flex>
            );
        }
    }, [
        styles.title,
        styles.chaptertitle,
        styles.chapter,
        styles.spoiled,
        Navigate,
        currentPageNumber,
        mangaData,
    ]);

    useEffect(() => {
        if (!currentPageNumber) return;
        if (!pages) return;

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

            if (codeMaps[code])
                codeMaps[code] === -1 ? decrementPage() : incrementPage();
            else if (code === "Backspace") return Navigate(-1);
        };

        window.addEventListener("keydown", onKeyPress);
        return () => window.removeEventListener("keydown", onKeyPress);
    });

    const downloadPage = useCallback(
        async (page: Page): Promise<Page> => {
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
        },
        [pages]
    );

    const [loadingQueue, setLoadingQueue] = useState<Array<Page>>([]);
    const loadingQueueOnFinishedHandler = useCallback(
        (pages: Array<Page>) =>
            setPages((oldPages) =>
                oldPages
                    ? [...oldPages].map(
                          (n) => pages.find((y) => y.url === n.url) ?? n
                      )
                    : null
            ),
        []
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
                setCurrentPageNumber(1);
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

    const shouldHide = false;
    const forceShow = false;
    // If there are no pages, simply show a loading progress.
    if (!pages || pages.length <= 0)
        return (
            <Flex
                flexDirection="column"
                className={css(styles.reader)}
                justifyContent="center"
                alignItems="center"
            >
                <Text
                    color="whitesmoke"
                    fontFamily="Cascadia Code"
                    marginTop="-8px"
                    marginBottom="8px"
                    fontSize="16px"
                >
                    Loading pages...
                </Text>
                <CircularProgress showTimeElapsed />
            </Flex>
        );

    return (
        <div className={css(styles.reader)}>
            {mangaData.chapters ? (
                <Chapters
                    onChapterSelect={(chapterId) => {
                        updateMangaData((oldMangaData) => ({
                            ...oldMangaData,
                            chapterId,
                        }));

                        const newParams = new URLSearchParams(queryParams);
                        newParams.set("chapter", chapterId);

                        setQueryParams(newParams);
                        setCurrentPageNumber(null);
                    }}
                    chapters={mangaData.chapters}
                    isOpen={chaptersAreOpen}
                    onClose={onChaptersClose}
                />
            ) : null}
            {displayIntermediary ? intermediaryContainer : currentMangaPage}
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
                        setIntermediary(false);
                        setCurrentPageNumber(tab);
                    }}
                    pages={pages.length ?? 1}
                    current={currentPageNumber}
                />
            ) : null}
        </div>
    );
};

export default Reader;

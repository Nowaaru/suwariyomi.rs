import { StyleSheet, css } from "aphrodite";
import { format } from "date-fns";
import { Button, Tooltip } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { Chapter as MangaChapter, Manga } from "types/manga";
import {
    compileChapterTitle,
    formatDate,
    isChapterCompleted,
} from "util/textutil";
import { useNavigate } from "react-router";

type ChapterProps = {
    chapter: MangaChapter;
    id?: string;
    onClick?: () => void;
};

const Chapter = (props: ChapterProps) => {
    const { chapter, onClick } = props;
    const styles = useMemo(
        () =>
            StyleSheet.create({
                chapter: {
                    display: "flex",
                    minWidth: "400px",
                    flexDirection: "row",
                    color: "whitesmoke",
                    fontFamily: "Cascadia Code",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    paddingBottom: "8px",
                    paddingTop: "8px",
                    height: "100px",
                },

                meta: {
                    display: "flex",
                    flexGrow: 1,
                    flexDirection: "column",
                },

                interactable: {
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    verticalAlign: "center",
                    justifyContent: "center",
                },

                title: {
                    fontSize: "20px",
                },

                scanlators: {
                    color: "#fb8e84",
                    fontSize: "16px",
                },

                date: {
                    color: "#fb8e84",
                    fontSize: "10px",
                    marginTop: "8px",
                    marginBottom: "-6px",
                },

                read: {
                    backgroundColor: "#fb8e84",
                    width: "128px",
                },
            }),
        []
    );

    const Navigate = useNavigate();
    const isUnread = Math.min(chapter.pages, chapter.total ?? 0) <= 0;
    const isCompleted = isChapterCompleted(chapter); // In case of final scanlator pages, allow wiggle room.

    const readOrContinue = isUnread ? "Read" : "Continue";
    const pageDisplay = isUnread
        ? "Unread"
        : `Page ${chapter.pages}/${chapter.total}`;

    return (
        <div className={css(styles.chapter)} id={props.id}>
            <div className={css(styles.meta)}>
                <span className={css(styles.title)}>
                    {compileChapterTitle(chapter)}
                </span>
                <span className={css(styles.scanlators)}>
                    {chapter.scanlators.join(", ")}
                </span>
                <span className={css(styles.date)}>
                    {formatDate(chapter.date_uploaded)}
                </span>
            </div>
            <div className={css(styles.interactable)}>
                <Tooltip label={isCompleted ? "Completed" : pageDisplay}>
                    <Button
                        onClick={
                            onClick ??
                            (() => {
                                Navigate(
                                    `/reader?manga=${chapter.manga_id}&chapter=${chapter.id}&source=${chapter.source}`
                                );
                            })
                        }
                        sx={styles.read._value as Record<string, string>}
                    >
                        {isCompleted ? "Reread" : readOrContinue}
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};

export default Chapter;

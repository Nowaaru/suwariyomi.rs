import { Chapter } from "types/manga";
import format from "date-fns/format"

export const compileChapterText = (chapter: Chapter, short?: boolean) => {
    const ch = short ? "Ch." : "Chapter";

    return `${ch} ${chapter.chapter}`;
};

export const compileVolumeText = (
    chapter: Chapter & { volume: number },
    short?: boolean
) => {
    const vol = short ? "Vol." : "Volume";

    return `${vol} ${chapter.volume}`;
};

export const isChapterCompleted = (chapter: Chapter) => chapter.pages >= chapter.count - 1;

export const formatDate = (date: Date | number, short?: boolean) => {
    return format(new Date(date), short ? "MMM. do, yyyy" : "MMMM do, yyyy");
}

export const chapterLastUpdated = (chapter: Chapter) => {
    return Math.max(chapter.last_updated, chapter.date_uploaded);
}

export const compileChapterTitle = (chapter: Chapter, short?: boolean, forceNoTitle?: boolean) => {
    return (forceNoTitle ? undefined : chapter.title) ?? (chapter.volume
        ? `${compileVolumeText(
              chapter as Chapter & { volume: number },
              short
          )} ${compileChapterText(chapter, short)}`
        : compileChapterText(chapter, short))
};

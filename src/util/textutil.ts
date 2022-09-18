import { Chapter } from "types/manga";
import format from "date-fns/format";

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

export const isChapterCompleted = (chapter: Chapter) =>
    chapter.total && chapter.pages >= chapter.total - 1;

export const formatDate = (date: Date | number, short?: boolean) => {
    return date === -1 ? date : format(new Date(date), short ? "MMM. do, yyyy" : "MMMM do, yyyy");
};

export const compileChapterTitle = (
    chapter: Chapter,
    short?: boolean,
    forceNoTitle?: boolean
) => {
    if (!forceNoTitle && chapter.title && chapter.title.length > 0)
        return chapter.title;

    return chapter.volume
        ? `${compileVolumeText(
              chapter as Chapter & { volume: number },
              short
          )} ${compileChapterText(chapter, short)}`
        : compileChapterText(chapter, short);
};

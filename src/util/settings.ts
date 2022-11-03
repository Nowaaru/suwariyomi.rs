import { appDir, downloadDir } from "@tauri-apps/api/path";
import { Schema } from "jsonschema";

type Unimplemented = Record<string, never>;

enum ThemeType {
    Light,
    Dark,
}

enum UpdateFrequency {
    Manual,
    TwiceDaily,
    Daily,
    TwoDays,
    ThreeDays,
    Weekly,
}

enum PageType {
    SinglePage,
    DoublePage,
}

enum DateFormat {
    MMDDYYYY = "MM/DD/YYYY",
    DDMMYYYY = "DD/MM/YYYY",
    YYYYMMDD = "YYYY/MM/DD",
    Default = MMDDYYYY,
}

enum ReadingMode {
    RightToLeft,
    LeftToRight,
    Vertical,
    Webtoon,
    ContinuousVertical,
}

enum NavigationLayout {
    TopAndBottom,
    LeftAndRight,
    Kindle,
    LShaped,
    Edge,
    None,
}

enum ScaleType {
    Comfortable,
    FitWidth,
    FitHeight,
    FitContent,
}

enum SidePadding {
    None = "none",
    Quarter = "25%",
    Half = "50%",
    ThreeQuarters = "75%",
}

enum BlendMode {
    Default,
    Multiply,
    Screen,
    Overlay,
    Dodge,
    Burn,
}

export type Settings = {
    General: {
        locale: string;
        dateFormat: DateFormat;
        autoUpdate: boolean;
        discordRPCIntegration: boolean;
        minimizeToTray: boolean;
        closeToTray: boolean;
    };
    Library: {
        updateOnKeyPress: boolean;
        refreshCovers: boolean;
        ignoreArticles: boolean;
        searchSuggestions: boolean;
        updateOngoingMangaOnly: boolean;
        updateFrequency: UpdateFrequency;
    };
    Appearance: {
        theme: ThemeType;
        themeStyleDark: string;
        themeStyleLight: string;
    };
    Reader: {
        lightbarVertical: boolean;
        lightbarRight: boolean;
        lightbarEnabled: boolean;
        skipChaptersOfDifferentGroup: boolean;
        skipChaptersMarkedRead: boolean;
        readingMode: ReadingMode;
        navLayoutPaged: NavigationLayout;
        invertTappingPaged: boolean;
        scaleType: ScaleType;
        cropBordersPaged: boolean;
        pageLayoutPaged: PageType;
        navLayoutWebtoon: NavigationLayout;
        invertTappingWebtoon: boolean;
        sidePaddingWebtoon: SidePadding;
        allowZoomOutWebtoon: boolean;
        // If the next chapter has the same chapter number but a different group, skip it.
        // This usually just means that the chapter was translated by two different translators.

        useCustomColorFilter: boolean;
        filterR: number;
        filterG: number;
        filterB: number;
        filterA: number;
        blendMode: BlendMode;
    };
    Downloads: {
        location: Promise<string>;
        saveChaptersAsCBZ: boolean;
        removeWhenMarkedRead: boolean;
        removeAfterRead: boolean;
        downloadNewChapters: boolean;
        deleteRemovedChapters: boolean; // Delete downloaded chapters if the source has removed the chapter from the website
    };
    Browse: {
        checkForUpdates: boolean;
        onlySearchPinned: boolean;
        showNSFWSources: boolean;
    };
    Tracking: {
        syncChaptersAfterReading: boolean;
        trackWhenAddingToLibrary: boolean;
        updateWhenMarkedAsRead: boolean;
    };
    Backup: Unimplemented;
    Security: Unimplemented;
    Advanced: {
        sendCrashReports: boolean;
    };
};

export type LoadedSettings = Omit<Settings, "Downloads"> & {
    Downloads: Omit<Settings["Downloads"], "location"> & { location: string };
};

export const DefaultSettings: Settings = {
    General: {
        locale: "en",
        dateFormat: DateFormat.Default,
        autoUpdate: true,
        discordRPCIntegration: true,
        minimizeToTray: false,
        closeToTray: false,
    },
    Library: {
        updateOnKeyPress: false,
        refreshCovers: true,
        ignoreArticles: false,
        searchSuggestions: true,
        updateOngoingMangaOnly: false,
        updateFrequency: UpdateFrequency.Daily,
    },
    Appearance: {
        theme: ThemeType.Dark,
        themeStyleDark: "default",
        themeStyleLight: "default",
    },
    Reader: {
        lightbarVertical: false,
        lightbarRight: false,
        lightbarEnabled: true,
        skipChaptersOfDifferentGroup: false,
        skipChaptersMarkedRead: false,
        readingMode: ReadingMode.RightToLeft,
        navLayoutPaged: NavigationLayout.LeftAndRight,
        invertTappingPaged: false,
        scaleType: ScaleType.Comfortable,
        cropBordersPaged: false,
        pageLayoutPaged: PageType.SinglePage,
        navLayoutWebtoon: NavigationLayout.TopAndBottom,
        invertTappingWebtoon: false,
        sidePaddingWebtoon: SidePadding.None,
        allowZoomOutWebtoon: false,
        // If the next chapter has the same chapter number but a different group, skip it.
        // This usually just means that the chapter was translated by two different translators.

        useCustomColorFilter: false,
        filterR: 255,
        filterG: 255,
        filterB: 255,
        filterA: 1,
        blendMode: BlendMode.Default,
    },
    Downloads: {
        location: downloadDir(),
        saveChaptersAsCBZ: false,
        removeWhenMarkedRead: false,
        removeAfterRead: false,
        downloadNewChapters: false,
        deleteRemovedChapters: false, // Delete downloaded chapters if the source has removed the chapter from the website
    },
    Browse: {
        checkForUpdates: true,
        onlySearchPinned: false,
        showNSFWSources: true,
    },
    Tracking: {
        syncChaptersAfterReading: true,
        trackWhenAddingToLibrary: false,
        updateWhenMarkedAsRead: false,
    },
    Backup: {},
    Security: {},
    Advanced: {
        sendCrashReports: true,
    },
};

export const SettingsSchema: Schema = {
    type: "object",
    properties: {
        General: {
            type: "object",
            properties: {
                locale: {
                    title: "Locale",
                    type: "string",
                    description: "The language of the application.",
                },
                dateFormat: {
                    title: "Date Format",
                    type: "string",
                    enum: [
                        DateFormat.DDMMYYYY,
                        DateFormat.MMDDYYYY,
                        DateFormat.YYYYMMDD,
                    ],
                    description: "The format to use for dates.",
                },
                autoUpdate: {
                    title: "Auto Update",
                    type: "boolean",
                    description:
                        "Whether to update the application automatically.",
                },
                discordRPCIntegration: {
                    title: "Discord RPC Integration",
                    type: "boolean",
                    description:
                        "Show your activity to discord. Also enables a reader toolbox icon that toggles this option.",
                },
                minimizeToTray: {
                    title: "Minimize to Tray",
                    type: "boolean",
                    description:
                        "Minimize the applicaton to the system tray or to the taskbar.",
                },
                closeToTray: {
                    title: "Close to Tray",
                    type: "boolean",
                    description:
                        "Close the applicaton into the tray or to close the app entirely.",
                },
            },
        },
        Library: {
            type: "object",
            properties: {
                updateOnKeyPress: {
                    title: "Update on Key Press",
                    type: "boolean",
                    description:
                        'Update the search query on keypress. Disabled until there isAbortController support in the Tauri "http" api.',
                },
                refreshCovers: {
                    title: "Refresh Covers",
                    type: "boolean",
                    description:
                        "Change covers to the latest volume if present every update. Will not change if you have a custom cover set.",
                },
                ignoreArticles: {
                    title: "Ignore Articles",
                    type: "boolean",
                    description:
                        'Ignore initial articles like "the" when searching.',
                },
                searchSuggestions: {
                    title: "Search Suggestions",
                    type: "boolean",
                    description:
                        "Show a placeholder that recommends you a search in the Library.",
                },
                updateOngoingMangaOnly: {
                    title: "Update Ongoing Manga Only",
                    type: "boolean",
                    description:
                        "Only update manga that is ongoing. Useful to reduce web requests.",
                },
                updateFrequency: {
                    title: "Update Frequency",
                    type: "number",
                    enum: [
                        UpdateFrequency.Daily,
                        UpdateFrequency.Manual,
                        UpdateFrequency.ThreeDays,
                        UpdateFrequency.TwiceDaily,
                        UpdateFrequency.TwoDays,
                        UpdateFrequency.Weekly,
                    ],
                    description: "How often to update the manga library.",
                },
            },
        },
        Appearance: {
            type: "object",
            properties: {
                theme: {
                    title: "Theme",
                    type: "string",
                    enum: [ThemeType.Dark, ThemeType.Light],
                    description: "The theme for the application.",
                },
                themeStyleDark: {
                    title: "Theme Style",
                    type: "string",
                    maxLength: 100,
                    description: "The style of the application.",
                },
                themeStyleLight: {
                    title: "Theme Style",
                    type: "string",
                    maxLength: 100,
                    description: "The style of the application.",
                },
            },
        },
        Reader: {
            type: "object",
            properties: {
                lightbarVertical: {
                    title: "Vertical Lightbar",
                    type: "boolean",
                    description: "Display the lightbar vertically.",
                },
                lightbarRight: {
                    title: "Lightbar on Right Side",
                    type: "boolean",
                    description:
                        "Display the lightbar on the right. Only works if Vertical Lightbar is enabled.",
                },
                lightbarEnabled: {
                    title: "Lightbar Enabled",
                    type: "boolean",
                    description: "Display the lightbar.",
                },
                skipChaptersOfDifferentGroup: {
                    title: "Skip Chapters of Different Group",
                    type: "boolean",
                    description:
                        "Skip chapters that were scanlated by a different group.",
                },
                skipChaptersMarkedRead: {
                    title: "Skip Chapters Marked as Read",
                    type: "boolean",
                    description: "Skip chapters marked as read.",
                },
                readingMode: {
                    title: "Reading Mode",
                    type: "number",
                    enum: [
                        ReadingMode.ContinuousVertical,
                        ReadingMode.LeftToRight,
                        ReadingMode.RightToLeft,
                        ReadingMode.Vertical,
                        ReadingMode.Webtoon,
                    ],
                    description: "The method of reading the manga.",
                },
                navLayoutPaged: {
                    title: "Navigation Layout (Paged)",
                    type: "number",
                    enum: [
                        NavigationLayout.Edge,
                        NavigationLayout.Kindle,
                        NavigationLayout.LShaped,
                        NavigationLayout.LeftAndRight,
                        NavigationLayout.None,
                        NavigationLayout.TopAndBottom,
                    ],
                    description: "The method of changing pages when reading.",
                },
                invertTappingPaged: {
                    title: "Invert Tapping (Paged)",
                    type: "boolean",
                    description:
                        "Invert the functionality of the paged navigation layout.",
                },
                scaleType: {
                    title: "Scale Type",
                    type: "number",
                    enum: [
                        ScaleType.Comfortable,
                        ScaleType.FitContent,
                        ScaleType.FitHeight,
                        ScaleType.FitWidth,
                    ],
                    description: "The appearance of the page when reading.",
                },
                cropBordersPaged: {
                    title: "Cropped Borders",
                    type: "boolean",
                    description:
                        "Trim the edges of the page when reading. Only in paged mode.",
                },
                navLayoutWebtoon: {
                    title: "Navigation Layout (Webtoon)",
                    type: "number",
                    enum: [
                        NavigationLayout.Edge,
                        NavigationLayout.Kindle,
                        NavigationLayout.LShaped,
                        NavigationLayout.LeftAndRight,
                        NavigationLayout.None,
                        NavigationLayout.TopAndBottom,
                    ],
                    description: "The method of chanigng pages when reading.",
                },
                invertTappingWebtoon: {
                    title: "Invert Tapping (Webtoon)",
                    type: "boolean",
                    description:
                        "Invert the functionality of the webtoon navigation layout.",
                },
                sidePaddingWebtoon: {
                    title: "Side Padding (Webtoon)",
                    type: "string",
                    enum: [
                        SidePadding.None,
                        SidePadding.Half,
                        SidePadding.Quarter,
                        SidePadding.ThreeQuarters,
                    ],
                    description: "The appearance of the page when reading.",
                },
                allowZoomOutWebtoon: {
                    title: "Allow Zooming Out",
                    type: "boolean",
                    description:
                        "Allow zooming out when reading webtoon content.",
                },
                useCustomColorFilter: {
                    title: "Custom Color Filter",
                    type: "boolean",
                    description: "Use a custom color filter when reading.",
                },
                filterR: {
                    title: "R",
                    type: "number",
                    minimum: 0,
                    maximum: 255,
                },
                filterG: {
                    title: "G",
                    type: "number",
                    minimum: 0,
                    maximum: 255,
                },
                filterB: {
                    title: "B",
                    type: "number",
                    minimum: 0,
                    maximum: 255,
                },
                filterA: {
                    title: "A",
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                },
                blendMode: {
                    title: "Blend Mode",
                    type: "number",
                    enum: [
                        BlendMode.Burn,
                        BlendMode.Default,
                        BlendMode.Multiply,
                        BlendMode.Dodge,
                        BlendMode.Overlay,
                        BlendMode.Screen,
                    ],
                    description: "How the colors affect the page.",
                },
            },
        },
        Downloads: {
            type: "object",
            properties: {
                location: {
                    title: "Download Location",
                    type: "string",
                    description: "Download location for saved manga.",
                },
                saveChaptersAsCBZ: {
                    title: "Save Chapters as CBZ",
                    type: "boolean",
                    description: "Save chapters as a CBZ archive file.",
                },
                removeWhenMarkedRead: {
                    title: "Remove When Marked as Read",
                    type: "boolean",
                    description: "Remove downloaded chapters when marked read.",
                },
                removeAfterRead: {
                    title: "Remove After Read",
                    type: "boolean",
                    description:
                        "Remove downloaded chapters after reaching the last page.",
                },
                downloadNewChapters: {
                    title: "Auto Chapter Download",
                    type: "boolean",
                    description:
                        "Automatically download newly-released chapters.",
                },
                deleteRemovedChapters: {
                    title: "Auto Chapter Removal",
                    type: "boolean",
                    description:
                        "Automatically delete chapters that are removed from the reader.",
                },
            },
        },
        Browse: {
            type: "object",
            properties: {
                checkForUpdates: {
                    title: "Check for Updates",
                    type: "boolean",
                    description: "Automatically check for source updates.",
                },
                onlySearchPinned: {
                    title: "Only Search Pinned",
                    type: "boolean",
                    description: "Only search pinned sources.",
                },
                showNSFWSources: {
                    title: "Only Show NSFW",
                    type: "boolean",
                    description: "Show not safe for work sources.",
                },
            },
        },
        Tracking: {
            type: "object",
            properties: {
                syncChaptersAfterReading: {
                    title: "Sync Chapters",
                    type: "boolean",
                    description:
                        "Automatically update tracker when completing a chapter.",
                },
                trackWhenAddingToLibrary: {
                    title: "Auto Track",
                    type: "boolean",
                    description:
                        "Automatically track when adding a manga to the library.",
                },
                updateWhenMarkedAsRead: {
                    title: "Auto Update Trackers",
                    type: "boolean",
                    description:
                        "Update trackers when marking a chapter as read.",
                },
            },
        },
        Backup: {
            type: "object",
            maxProperties: 0,
        },
        Security: {
            type: "object",
            maxProperties: 0,
        },
        Advanced: {
            type: "object",
            properties: {
                sendCrashReports: {
                    title: "Upload Crash Reports",
                    type: "boolean",
                    description:
                        "Whether to send crash reports when the application exits unexpectedly.",
                },
            },
        },
    },
};

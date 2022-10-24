import { appDir, downloadDir } from "@tauri-apps/api/path";

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
        pageLayoutWebtoon: PageType;
        invertDoublePagesWebtoon: boolean;
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
    downloads: {
        location: Promise<string>;
        saveChaptersAsCBZ: boolean;
        removeWhenMarkedRead: boolean;
        removeAfterRead: boolean;
        downloadNewChapters: boolean;
        deleteRemovedChapters: boolean; // Delete downloaded chapters if the source has removed the chapter from the website
    };
    browse: {
        checkForUpdates: boolean;
        onlySearchPinned: boolean;
        showNSFWSources: boolean;
    };
    tracking: {
        syncChaptersAfterReading: boolean;
        trackWhenAddingToLibrary: boolean;
        updateWhenMarkedAsRead: boolean;
    };
    backup: Unimplemented;
    security: Unimplemented;
    advanced: {
        sendCrashReports: boolean;
    };
};

export type LoadedSettings = Settings & {
    downloads: Omit<Settings["downloads"], "location"> & { location: string };
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
        pageLayoutWebtoon: PageType.SinglePage,
        invertDoublePagesWebtoon: false,
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
    downloads: {
        location: downloadDir(),
        saveChaptersAsCBZ: false,
        removeWhenMarkedRead: false,
        removeAfterRead: false,
        downloadNewChapters: false,
        deleteRemovedChapters: false, // Delete downloaded chapters if the source has removed the chapter from the website
    },
    browse: {
        checkForUpdates: true,
        onlySearchPinned: false,
        showNSFWSources: true,
    },
    tracking: {
        syncChaptersAfterReading: true,
        trackWhenAddingToLibrary: false,
        updateWhenMarkedAsRead: false,
    },
    backup: {},
    security: {},
    advanced: {
        sendCrashReports: true,
    },
};

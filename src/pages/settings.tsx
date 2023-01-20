import {
    Box,
    Divider,
    IconButton,
    Tab,
    TabList,
    TabPanels,
    Tabs,
    Tooltip,
} from "@chakra-ui/react";

import { StyleSheet, css } from "aphrodite";
import CircularProgress from "components/circularprogress";
import { Schema } from "jsonschema";
import _ from "lodash";
import { useMemo, useState, useRef, useEffect } from "react";

import { MdArrowBackIosNew } from "react-icons/md";
import { Link } from "react-router-dom";
import useScrollbar from "util/hook/usescrollbar";
import ipcFunctions from "util/ipc";

import {
    DefaultSettings,
    LoadedSettings,
    Neverless,
    SettingsSchema,
} from "util/settings";
import { ChangeHandler, SettingsHandler } from "util/settingshandler";

const Settings = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const mainSettingsRef = useRef<HTMLDivElement | null>(null);
    const handler = useMemo(
        () => new SettingsHandler(DefaultSettings, SettingsSchema),
        []
    );

    const [tabContent, setTabContent] = useState<{
        content: JSX.Element;
        allTabs: Array<string>;
        schema: Schema;
        tab: number;
    } | null>(null);

    useEffect(() => {
        if (!tabContent || tabContent.tab !== tabIndex)
            handler
                .construct(Promise.resolve(SettingsSchema), (newValue, id) => {
                    if (!tabContent || !id) return;
                    handler.getSettings().then((settings) => {
                        // TODO: make this not stupid
                        const settingsKey = tabContent.allTabs[
                            tabIndex
                        ] as keyof typeof settings;

                        const partialSettings = _.omit(
                            settings[settingsKey],
                            (
                                Object.keys(settings) as Array<
                                    keyof typeof settings
                                >
                            ).filter(
                                (key) =>
                                    Object.keys(settings[key] ?? {}).length > 0
                            )
                        ) as Neverless<{
                            -readonly [K in keyof LoadedSettings]: LoadedSettings[K];
                        }>;

                        partialSettings[id as keyof typeof partialSettings] =
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            newValue as any; // idk mf theres like 4000 different types that could be in here
                                             // how do you expect me to make this not stupid

                        console.log(partialSettings);
                        /*ipcFunctions.app.setAppSettings({
                            ...settings,
                            [settingsKey]: partialSettings,
                        });*/
                    });
                })
                .then(async (jsxObject) => {
                    const allTabs = await handler.getTabs();
                    const curSchema = await handler.getSchema();

                    setTabContent((oldContent) => ({
                        tab: tabIndex,
                        allTabs: oldContent?.allTabs ?? allTabs,
                        schema: oldContent?.schema ?? curSchema,
                        content:
                            jsxObject[
                                allTabs[tabIndex] as keyof typeof jsxObject
                            ],
                    }));
                });
    }, [tabIndex]);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                settings: {
                    backgroundColor: "#0D1620",
                    color: "whitesmoke",
                    width: "100vw",
                    height: "100vh",
                    overflowX: "hidden",
                    overflowY: "scroll",
                    paddingTop: "16px",
                    paddingBottom: "32px",
                },
            }),
        []
    );

    useScrollbar(mainSettingsRef);
    return (
        <Box className={css(styles.settings)} ref={mainSettingsRef}>
            <Tabs
                onChange={(index) => setTabIndex(index)}
                align="center"
                variant="soft-rounded"
            >
                <TabList position="sticky">
                    <Link to="/">
                        <Tooltip label="Back">
                            <IconButton
                                aria-label="Back"
                                marginRight="8px"
                                icon={<MdArrowBackIosNew />}
                                backgroundColor="transparent"
                                borderRadius="50%"
                                _hover={{
                                    backgroundColor: "#BEE3F8",
                                    color: "#f88379",
                                }}
                            />
                        </Tooltip>
                    </Link>
                    {tabContent?.allTabs.map((value) => (
                        <Tab
                            sx={{
                                ["&[aria-selected=true]"]: {
                                    color: "#f88379",
                                },
                            }}
                            key={value}
                        >
                            {value}
                        </Tab>
                    )) ?? null}
                </TabList>
                <Divider
                    marginTop="12px"
                    width="85%"
                    borderStyle="dashed"
                    borderColor="#000000CC"
                />
                <TabPanels maxWidth={ tabContent ? "55%" : "unset"}>
                    {tabContent ? tabContent.content : <CircularProgress />}
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default Settings;

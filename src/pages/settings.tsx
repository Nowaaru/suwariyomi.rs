import { ArrowBackIcon } from "@chakra-ui/icons";
import {
    Box,
    Divider,
    IconButton,
    Tab,
    TabList,
    TabPanels,
    Tabs,
    Text,
    Tooltip,
} from "@chakra-ui/react";
import { StyleSheet, css } from "aphrodite";
import { useMemo, useState, useRef } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { Link } from "react-router-dom";
import useScrollbar from "util/hook/usescrollbar";

import { DefaultSettings, SettingsSchema } from "util/settings";
import { SettingsHandler } from "util/settingshandler";

const Settings = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const mainSettingsRef = useRef<HTMLDivElement | null>(null);
    const handler = useMemo(
        () => new SettingsHandler(DefaultSettings, SettingsSchema),
        []
    );
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
                    {handler.getTabs().map((value) => (
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
                    ))}
                </TabList>
                <Divider
                    marginTop="12px"
                    width="85%"
                    borderStyle="dashed"
                    borderColor="#000000CC"
                />
                <TabPanels>
                    {
                        handler.construct(SettingsSchema)[
                            handler.getTabs()[tabIndex]
                        ]
                    }
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default Settings;

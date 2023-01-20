import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { DefaultSettings, SettingsSchema } from "util/settings";
import { SettingsHandler } from "util/settingshandler";
import CircularProgress from "./circularprogress";
import MangaModal from "./modal";

import uninterfacedConsole from "util/console";

type MangaSettingsProps = {
    onClose: () => void;
    isOpen: boolean;
};

const MangaSettings = ({ onClose, isOpen }: MangaSettingsProps) => {
    const [handlerInitialized, setHandlerInitialized] = useState(false);
    const [settingsContent, setSettingsContent] = useState<JSX.Element | null>(
        null
    );

    const handler = useMemo(
        async () => new SettingsHandler(DefaultSettings, SettingsSchema).init(),
        []
    );

    useEffect(() => {
        if (handlerInitialized) return;

        handler.then((handler) => {
            setHandlerInitialized(true);
            handler
                .construct(handler.getSchema(), uninterfacedConsole.log)
                .then((content) => {
                    setSettingsContent(content.Reader);
                });
        });
    }, [handlerInitialized, handler]);

    if (isOpen && (!settingsContent || !handlerInitialized))
        return (
            <Flex
                position="absolute"
                width="full"
                height="full"
                justifyContent="center"
                alignItems="center"
                alignContent="center"
                zIndex={165}
                backgroundColor="#00000066"
                onClick={onClose}
            >
                <Flex
                    backgroundColor="#0D1620"
                    justifyContent="center"
                    alignItems="center"
                    alignContent="center"
                    width="64"
                    height="64"
                    borderRadius="8px"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CircularProgress
                        progressLabel="Loading settings..."
                        showTimeElapsed
                    />
                </Flex>
            </Flex>
        );

    return (
        <MangaModal
            content={settingsContent}
            header={<Text>Settings</Text>}
            isOpen={isOpen}
            onClose={onClose}
        />
    );
};

export default MangaSettings;

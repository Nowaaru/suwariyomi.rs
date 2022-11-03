import {
    SettingsSchema,
    DefaultSettings,
    LoadedSettings,
    Settings,
} from "./settings";
import { Schema } from "jsonschema";
import { css, StyleSheet } from "aphrodite";
import { Box, Button, Icon, Text, Tooltip, VStack } from "@chakra-ui/react";
import { MdUndo } from "react-icons/md";

export class SettingsHandler {
    /**
     * Settings handler to easily change and render settings.
     * @constructor
     * @param {Settings} currentSettings - The current settings. Falls back to default settings.
     * @param {Schema} schema - The expected schema. Falls back to default schema.
     */
    constructor(
        currentSettings: LoadedSettings | Settings = DefaultSettings,
        schema: Schema = SettingsSchema
    ) {
        const newSettings = { ...currentSettings };
        const newSchema = { ...schema };
        this.schema = newSchema;

        Promise.resolve(newSettings.Downloads.location).then(
            (downloadLocation) => {
                newSettings.Downloads.location = downloadLocation;
                this.settings = newSettings;
            }
        );
    }

    public getTabs(schema: Schema = this.schema): Array<keyof Settings> {
        return Object.keys(schema.properties!) as Array<keyof Settings>;
    }

    public construct(
        schema: Schema = this.schema
    ): Record<keyof Settings, JSX.Element> {
        return Object.fromEntries(
            this.getTabs(schema).map((key) => {
                return [
                    key,
                    <Box
                        textAlign="start"
                        width="55%"
                        fontSize="32px"
                        marginTop="8px"
                    >
                        <VStack>
                            {Object.values(
                                schema?.properties?.[key]?.properties ?? {}
                            ).map((value) => (
                                <Box
                                    backgroundColor="#00000099"
                                    width="100%"
                                    height="fit-content"
                                    minHeight="110px"
                                    maxHeight="140px"
                                    borderRadius="8px"
                                    padding="16px"
                                    position="relative"
                                >
                                    <Tooltip
                                        label="Reset to Default"
                                        hasArrow
                                        marginTop="8px"
                                    >
                                        <button
                                            className={css(
                                                this.styles.resetButton
                                            )}
                                        >
                                            <Icon position="absolute" top="0.5" left="0.5" width="16px" height="16px" >
                                                <MdUndo />
                                            </Icon>
                                        </button>
                                    </Tooltip>
                                    <Text fontSize="24px">{value.title}</Text>
                                    <Text
                                        fontSize="14px"
                                        fontFamily="Cascadia Code"
                                    >
                                        {value.description}
                                    </Text>
                                </Box>
                            ))}
                        </VStack>
                    </Box>,
                ] as [keyof Settings, JSX.Element];
            })
        ) as Record<keyof Settings, JSX.Element>;
    }

    private styles = StyleSheet.create({
        resetButton: {
            position: "relative",
            top: 8,
            right: 8,
            float: "right",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#f88379",
            transition: "border-radius 0.25s ease-in, rotate 0.25s ease-in-out, color 0.15s ease-in",
            color: "transparent",
            ":hover": {
                borderRadius: "4px",
                color: "whitesmoke",
                rotate: "45deg",
            },
        },
    });

    private settings?: Settings | LoadedSettings;

    private schema: Schema;
}

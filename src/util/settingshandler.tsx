import {
    Box,
    Flex,
    HStack,
    Icon,
    Text,
    Textarea,
    Tooltip,
    VStack,
} from "@chakra-ui/react";
import { css, StyleSheet } from "aphrodite";
import CheckboxRipple from "components/checkbox";
import Select from "components/select";
import { Schema } from "jsonschema";
import _ from "lodash";
import { MdError, MdRefresh } from "react-icons/md";
import {
    DefaultSettings,
    LoadedSettings,
    Settings,
    SettingsSchema,
} from "./settings";

export type ChangeHandler = (newValue: unknown, id?: string) => unknown;
const getElementFromValue = (
    value: Schema,
    tab?: keyof Settings,
    changeHandler?: ChangeHandler,
    curValue?: any
) => {
    const { type, id, enum: enumeration } = value;
    switch (type) {
        case "boolean": {
            return (
                <CheckboxRipple
                    defaultChecked={curValue}
                    onChange={(v) => changeHandler?.(v.target.checked, id)}
                />
            );
        }
        case "string": {
            if (enumeration) {
                const enumerationIndex = enumeration.findIndex(
                    (x) => x === curValue
                );

                const allTransformers: {
                    [key in keyof Settings]?: Record<
                        string,
                        (current: string, next: string) => void
                    >;
                } = {
                    General: {
                        locale: (
                            currentLocale: string,
                            targetLocale: string
                        ) => {
                            const intl = new Intl.DisplayNames(currentLocale, {
                                type: "language",
                            });
                            return intl.of(targetLocale) ?? targetLocale;
                        },
                    },
                };

                const transformer = tab
                    ? allTransformers[tab]?.[
                          value.id as keyof typeof allTransformers[typeof tab]
                      ]
                    : undefined;

                console.log(enumeration);
                return (
                    <Select
                        onChange={(n) =>
                            n ? changeHandler?.(n.value, id) : null
                        }
                        isSearchable={false}
                        styles={{
                            container: (provided) => ({
                                ...provided,
                                width: "fit-content",
                                minWidth: "160px",
                            }),
                            option: (provided) => ({
                                ...provided,
                                fontSize: "16px",
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                fontSize: "16px",
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                fontSize: "16px",
                            }),
                        }}
                        options={enumeration.map((n, i) => ({
                            label: transformer?.(curValue, n) ?? n,
                            value: i,
                        }))}
                        defaultValue={{
                            label:
                                transformer?.(curValue, curValue) ??
                                enumeration[enumerationIndex],
                            value: enumerationIndex,
                        }}
                        menuShouldScrollIntoView
                    />
                );
            }

            return (
                <Textarea
                    placeholder="Type here..."
                    defaultValue={curValue ?? null}
                    height="fit-content"
                    minHeight="16px"
                    paddingRight="16px"
                    resize="none"
                    onChange={(z) => changeHandler?.(z.target.value, id)}
                />
            );
        }
        default:
            return <MdError />;
    }
};

export class SettingsHandler {
    /**
     * Settings handler to easily change and render settings.
     * @constructor
     * @param {Settings} currentSettings - The current settings. Falls back to default settings.
     * @param {Schema} schema - The expected schema. Falls back to default schema.
     */
    constructor(
        currentSettings: Promise<LoadedSettings | Settings> = DefaultSettings,
        schema: Schema = SettingsSchema
    ) {
        this.schema = Promise.resolve({ ...schema });
        this.settings = Promise.resolve(currentSettings)
            .then((s) => s.Downloads.location)
            .then(async (downloadLocation) => {
                const newSettings = { ...(await currentSettings) };
                newSettings.Downloads.location = downloadLocation;

                return newSettings;
            });
    }

    public async init(): Promise<ThisType<SettingsHandler>> {
        return await Promise.all([this.schema, this.settings]);
    }

    public async getTabs(
        schema: Promise<Schema> | Schema = this.schema
    ): Promise<Array<keyof Settings>> {
        return Promise.resolve(schema).then(
            (schema) =>
                Object.keys(schema?.properties! ?? {}) as Array<keyof Settings>
        );
    }

    public async getSchema() {
        return this.schema.then(_.cloneDeep);
    }

    public async getSettings() {
        return this.settings.then(_.cloneDeep);
    }

    public async construct(
        schema: Promise<Schema> = this.schema,
        changeHandler: ChangeHandler
    ): Promise<Record<keyof Settings, JSX.Element>> {
        const currentSettings = await this.settings;
        return Promise.resolve(schema).then(async (schema) => {
            return Object.fromEntries(
                (await this.getTabs(schema)).map((key) => {
                    const currentTabSettings = currentSettings[key];
                    return [
                        key,
                        <Box
                            textAlign="start"
                            width="55%"
                            fontSize="32px"
                            marginTop="8px"
                            key={key}
                        >
                            <VStack>
                                {Object.values(
                                    schema.properties?.[key]?.properties ?? {}
                                ).map((value) => (
                                    <HStack
                                        backgroundColor="#00000099"
                                        width="100%"
                                        height="fit-content"
                                        minHeight="110px"
                                        maxHeight="140px"
                                        borderRadius="8px"
                                        padding="16px"
                                        position="relative"
                                        key={value.id ?? value.title}
                                    >
                                        <Box
                                            position="absolute"
                                            top="0.5px"
                                            right="0.5px"
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
                                                    <Icon
                                                        display="flex"
                                                        justifyContent="center"
                                                        overflow="visible"
                                                        alignItems="center"
                                                        marginBottom="5px"
                                                        marginLeft="2px"
                                                        width="16px"
                                                        height="16px"
                                                    >
                                                        <MdRefresh />
                                                    </Icon>
                                                </button>
                                            </Tooltip>
                                        </Box>
                                        <Box width="75%">
                                            <Text fontSize="24px">
                                                {value.title}
                                            </Text>
                                            <Text
                                                fontSize="14px"
                                                fontFamily="Cascadia Code"
                                            >
                                                {value.description}
                                            </Text>
                                        </Box>
                                        <Flex
                                            alignItems="center"
                                            justifyContent="center"
                                            width="25%"
                                            paddingRight="32px"
                                        >
                                            {getElementFromValue(
                                                value,
                                                key,
                                                changeHandler,
                                                value.id
                                                    ? currentTabSettings[
                                                          value.id as keyof typeof currentTabSettings
                                                      ]
                                                    : undefined
                                            )}
                                        </Flex>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>,
                    ] as [keyof Settings, JSX.Element];
                })
            ) as Record<keyof Settings, JSX.Element>;
        });
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
            transition:
                "border-radius 0.25s ease-in, rotate 0.25s ease-in-out, color 0.15s ease-in",
            color: "transparent",
            ":hover": {
                borderRadius: "4px",
                color: "whitesmoke",
                rotate: "45deg",
            },
        },
    });

    private settings: Promise<Settings | LoadedSettings>;

    private schema: Promise<Schema>;
}

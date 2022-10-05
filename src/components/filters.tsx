import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Checkbox,
    Divider,
    FormControl,
    FormLabel,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
} from "@chakra-ui/react";

import { css, StyleSheet } from "aphrodite";
import Select from "components/select";
import _ from "lodash";
import { ReactElement, useCallback, useMemo, useState } from "react";
import { FilterType, HasId, SearchFilter, SearchFilters } from "types/search";
import { AllIcons } from "util/search";
import SourceHandler, { Source } from "util/sources";
import Button from "./button";

const Filters = (props: {
    handler: Source;
    isOpen: boolean;
    onSubmit?: (filters: SearchFilters) => void;
    onClose: () => void;
}) => {
    const { handler, isOpen, onClose, onSubmit = _.noop } = props;
    const initialFilters = useMemo(
        () => _.cloneDeep(handler.filters),
        [handler.filters]
    );
    const [filters, setFilters] = useState<SearchFilters>(initialFilters); // useRef<SearchFilters>(initialFilters);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                header: {
                    color: "#fb8e84",
                    fontFamily: "Cascadia Code",
                    letterSpacing: "0.1px",
                },

                divider: {},
            }),
        []
    );

    const generateHierarchy = useCallback((): ReactElement => {
        const walker = (
            value: SearchFilter | HasId<SearchFilter>,
            key: string | number,
            isReadonly?: boolean
        ): ReactElement | null => {
            const currentFilters: SearchFilters = { ...filters };
            switch (value.type) {
                case FilterType.Readonly:
                case FilterType.Group: {
                    const { fields, sorted } = value;
                    const mapFn = (v: HasId<SearchFilter>) =>
                        walker(v, v.id, value.type === FilterType.Readonly);

                    const arrayValues = [...fields];
                    if (sorted)
                        arrayValues.sort((a, b) =>
                            (a.name ?? a.id).localeCompare(b.name ?? b.id)
                        );
                    return (
                        <Accordion allowToggle allowMultiple key={key}>
                            <AccordionItem border="none">
                                <AccordionButton
                                    backgroundColor="#00000022"
                                    transition="backgroundColor 0.2s"
                                    marginBottom="4px"
                                    marginTop="4px"
                                    _hover={{
                                        backgroundColor: "#33333322",
                                    }}
                                    borderRadius="4px"
                                >
                                    <Box flex="1" textAlign="left">
                                        {value.name ?? key}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <Stack>{arrayValues.map(mapFn)}</Stack>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    );
                }
                case FilterType.Checkbox: {
                    const {
                        checked = "unchecked",
                        name,
                        allowIndeterminate,
                    } = value;

                    const checkboxIcons = Object.assign(
                        {
                            checked: "CheckIcon",
                            indeterminate: "MinusIcon",
                        },
                        value.checkboxIcons ?? {}
                    );

                    const getIcon = (icon: keyof typeof AllIcons) => {
                        return AllIcons[icon];
                    };

                    const newIcons = {
                        checked: getIcon(checkboxIcons.checked),
                        indeterminate: getIcon(checkboxIcons.indeterminate),
                    };

                    return (
                        <Checkbox
                            isChecked={checked === "checked"}
                            isIndeterminate={
                                allowIndeterminate &&
                                checked === "indeterminate"
                            }
                            key={key}
                            onChange={() => {
                                switch (value.checked) {
                                    case "indeterminate":
                                        value.checked = "unchecked";
                                        break;
                                    case "checked":
                                        value.checked = allowIndeterminate
                                            ? "indeterminate"
                                            : "unchecked";
                                        break;
                                    default:
                                        value.checked = "checked";
                                        break;
                                }

                                setFilters(currentFilters);
                            }}
                            isDisabled={isReadonly}
                            size="lg"
                            iconColor="white"
                            sx={{
                                "& span.chakra-checkbox__control": {
                                    borderColor:
                                        value.checked !== "unchecked"
                                            ? "#f8837955"
                                            : "white",
                                    backgroundColor:
                                        value.checked !== "unchecked"
                                            ? "#f88379"
                                            : "transparent",

                                    ":hover": {
                                        borderColor:
                                            value.checked === "unchecked"
                                                ? "#f88379"
                                                : "white",
                                        backgroundColor:
                                            value.checked !== "unchecked"
                                                ? "#f88379"
                                                : "transparent",
                                        filter: "brightness(1.2)",
                                    },
                                },
                            }}
                            icon={
                                checked !== "unchecked" ? (
                                    <Icon as={newIcons[checked]} />
                                ) : undefined
                            }
                        >
                            {name ?? key}
                        </Checkbox>
                    );
                }
                case FilterType.Text: {
                    const { placeholderValue, value: currentValue } = value;
                    return (
                        <Input
                            placeholder={placeholderValue}
                            key={key}
                            onChange={(e) => {
                                value.value = e.target.value;
                                setFilters(currentFilters);
                            }}
                            value={currentValue}
                        />
                    );
                }
                case FilterType.Select: {
                    const { name, options, selected } = value;

                    return (
                        <Select
                            name={name}
                            key={key}
                            options={options}
                            value={selected}
                            onChange={(option) => {
                                value.selected = option ?? undefined;
                                setFilters(currentFilters);
                            }}
                        />
                    );
                }
                case FilterType.Date: {
                    const { maxDate, minDate, selectedDate, name } = value;
                    const sliceDate = (date: Date) =>
                        `${date.getUTCFullYear()}-${String(
                            date.getUTCMonth()
                        ).padStart(2, "0")}-${String(
                            date.getUTCDate()
                        ).padStart(2, "0")}`;

                    return (
                        <FormControl key={key}>
                            <FormLabel>{name ?? "Input"}</FormLabel>
                            <Input
                                sx={{
                                    "&": {
                                        colorScheme: "dark",
                                    },
                                }}
                                borderRadius="4px"
                                type="date"
                                size="md"
                                value={
                                    selectedDate
                                        ? sliceDate(selectedDate)
                                        : undefined
                                }
                                onChange={(e) => {
                                    value.selectedDate = new Date(
                                        Date.parse(e.target.value)
                                    );
                                    setFilters(currentFilters);
                                }}
                                min={minDate ? sliceDate(minDate) : undefined}
                                max={maxDate ? sliceDate(maxDate) : undefined}
                            />
                        </FormControl>
                    );
                }
                default:
                    return null;
            }
        };

        const out: Array<ReactElement | null> = [];
        (Object.keys(filters) as Array<string | number>).forEach((v) =>
            out.push(walker(filters[v], v))
        );

        return <>{out.filter((n) => n)}</>;
    }, [filters]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                setFilters(initialFilters);
                onClose();
            }}
        >
            <ModalOverlay />
            <ModalContent
                backgroundColor="#0D1620"
                position="relative"
                color="whitesmoke"
            >
                <ModalHeader>
                    Filters for{" "}
                    <span className={css(styles.header)}>{handler.id}</span>
                </ModalHeader>
                <ModalCloseButton />
                <Divider
                    position="relative"
                    marginTop="-8px"
                    marginBottom="8px"
                    borderColor="#00000099"
                    className={css(styles.divider)}
                />
                <ModalBody>
                    <Stack>{generateHierarchy()}</Stack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        onClick={() => {
                            onSubmit(filters);
                            onClose();
                        }}
                        variant="ghost"
                        mr={3}
                    >
                        Submit
                    </Button>
                    <Button colorScheme="blue" onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default Filters;

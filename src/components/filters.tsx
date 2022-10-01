import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Checkbox,
    Divider,
    Flex,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    useDisclosure,
} from "@chakra-ui/react";

import { css, StyleSheet } from "aphrodite";
import Select from "components/select";
import { ReactElement, useCallback, useMemo } from "react";
import { FilterType, HasId, SearchFilter } from "types/search";
import { AllIcons } from "util/search";
import { Source } from "util/sources";
import Button from "./button";

const Filters = (props: {
    handler: Source;
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { handler, isOpen, onClose } = props;

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
        const currentFilters = handler.filters;
        const walker = (
            value: SearchFilter | HasId<SearchFilter>,
            key: string | number,
            isReadonly?: boolean
        ): ReactElement | null => {
            /* eslint-disable no-case-declarations */
            switch (value.type) {
                case FilterType.Readonly:
                case FilterType.Group:
                    const { fields } = value;
                    return (
                        <Accordion allowToggle allowMultiple>
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
                                        {value.name ?? key}{" "}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    {fields.map((v) =>
                                        walker(
                                            v,
                                            v.id,
                                            value.type === FilterType.Readonly
                                        )
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    );

                case FilterType.Checkbox:
                    const { checked = "unchecked", name } = value;

                    const checkboxIcons = Object.assign(
                        value.checkboxIcons ?? {},
                        {
                            checked: "CheckIcon",
                            indeterminate: "MinusIcon",
                        }
                    );

                    const getIcon = (
                        icon: keyof typeof AllIcons
                    ): JSX.Element => {
                        const IconConstructor = AllIcons[
                            icon
                            // TODO: \/ this should not be here. fix this.
                        ] as unknown as React.FunctionComponent;

                        return <IconConstructor />;
                    };

                    const newIcons = {
                        checked: getIcon(checkboxIcons.checked),
                        indeterminate: getIcon(checkboxIcons.indeterminate),
                    };

                    return (
                        <Checkbox
                            checked={checked === "checked"}
                            isIndeterminate={checked === "indeterminate"}
                            isDisabled={isReadonly}
                            icon={
                                checked !== "unchecked"
                                    ? newIcons[checked]
                                    : undefined
                            }
                        >
                            {name ?? key}
                        </Checkbox>
                    );

                case FilterType.Text:
                    const { placeholderValue, value: currentValue } = value;
                    return (
                        <Input
                            placeholder={placeholderValue}
                            value={currentValue}
                        />
                    );

                case FilterType.Select:
                    return <Select />;

                default:
                    return null;
            }
        };

        const out: Array<ReactElement | null> = [];
        (Object.keys(currentFilters) as Array<string | number>).forEach((v) =>
            out.push(walker(currentFilters[v], v))
        );

        return <>{out.filter((n) => n)}</>;
    }, [handler.filters]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
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
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="ghost">Secondary Action</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default Filters;

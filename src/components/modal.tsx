import {
    Divider,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    ModalProps,
} from "@chakra-ui/react";

import { useMemo } from "react";
import { css, StyleSheet } from "aphrodite";

export type MangaModalProps = {
    header?: JSX.Element | null;
    footer?: JSX.Element | JSX.Element[] | null;
    content?: JSX.Element | JSX.Element[] | null;
    children?: never;

    headerClassName?: string;
    footerClassName?: string;
    contentClassName?: string;
} & Pick<ModalProps, "isOpen" | "onClose">;

const MangaModal = ({
    content,
    header,
    footer,
    isOpen,
    onClose,

    headerClassName,
    footerClassName,
    contentClassName,
}: MangaModalProps) => {
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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                backgroundColor="#0D1620"
                position="relative"
                color="whitesmoke"
                paddingBottom={footer ? "unset" : "32px"}
                width="fit-content"
                maxWidth="90vw"
                minWidth="450px"
            >
                <ModalHeader className={headerClassName}>
                    {header}
                    <ModalCloseButton color="whitesmoke" />
                </ModalHeader>
                {header ? (
                    <Divider
                        position="relative"
                        marginTop="-8px"
                        marginBottom="8px"
                        borderColor="#00000099"
                        className={css(styles.divider)}
                    />
                ) : null}

                {content ? (
                    <ModalBody maxHeight="750px" overflow="auto" className={contentClassName}>
                        {content}
                    </ModalBody>
                ) : null}
                {footer ? (
                    <ModalFooter className={footerClassName}>
                        {footer}
                    </ModalFooter>
                ) : null}
            </ModalContent>
        </Modal>
    );
};

export default MangaModal;

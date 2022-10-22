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
    header?: JSX.Element;
    footer?: JSX.Element | JSX.Element[];
    content?: JSX.Element | JSX.Element[];
    children?: never;
} & Pick<ModalProps, "isOpen" | "onClose">;

const MangaModal = ({
    content,
    header,
    footer,
    isOpen,
    onClose,
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
            >
                <ModalHeader>
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

                {content ? <ModalBody>{content}</ModalBody> : null}
                {footer ? <ModalFooter>{footer}</ModalFooter> : null}
            </ModalContent>
        </Modal>
    );
};

export default MangaModal;

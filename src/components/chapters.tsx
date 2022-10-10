import {
    Divider,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    VStack,
} from "@chakra-ui/react";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { Chapter as MangaChapter } from "types/manga";
import Button from "./button";
import Chapter from "./chapter";

const Chapters = ({
    isOpen,
    onClose,
    chapters,
}: {
    isOpen: boolean;
    onClose: () => void;
    chapters: Array<MangaChapter>;
}) => {
    const chaptersMap: Array<JSX.Element> = chapters.map((ch) => (
        <LazyLoadComponent key={ch.id}>
            <Chapter chapter={ch} />{" "}
        </LazyLoadComponent>
    ));

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent backgroundColor="#0D1620">
                <ModalHeader color="whitesmoke">Chapters</ModalHeader>
                <ModalCloseButton />
                <Divider
                    position="relative"
                    marginTop="-8px"
                    marginBottom="8px"
                    borderColor="#00000099"
                />
                <ModalBody>
                    <VStack
                        sx={{
                            "&::-webkit-scrollbar": {
                                width: "8px",
                            },

                            "&::-webkit-scrollbar-track": {
                                background: "#00000000",
                            },

                            "&::-webkit-scrollbar-thumb": {
                                background: "#fb8e84",
                                borderRadius: "2px",
                            },

                            "&::-webkit-scrollbar-thumb:hover": {
                                background: "#f88379",
                            },
                        }}
                        align="start"
                        gap="4"
                        width="fit-content"
                        minWidth="400px"
                        height="75vh"
                        overflowY="auto"
                        overflowX="hidden"
                    >
                        {chaptersMap}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default Chapters;

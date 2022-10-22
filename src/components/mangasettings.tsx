import { Text } from "@chakra-ui/react";
import MangaModal from "./modal";

type MangaSettingsProps = {
    onClose: () => void;
    isOpen: boolean;
};

const MangaSettings = ({ onClose, isOpen }: MangaSettingsProps) => {
    return (
        <MangaModal
            content={<Text>Hello, world! (1)</Text>}
            header={<Text>Hello, world! (2)</Text>}
            isOpen={isOpen}
            onClose={onClose}
        />
    );
};

export default MangaSettings;

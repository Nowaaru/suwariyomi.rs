import {
    Box,
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuList,
    Portal,
} from "@chakra-ui/react";
import { css, StyleSheet } from "aphrodite";
import { useMemo } from "react";

enum ContextMenuItem {
    Save = "Save",
    SaveTo = "Save To...",
    Share = "Share",
    Settings = "Settings",
    ToView = "Return to View",
    ToHome = "Return to Library",
    Chapters = "Chapters",
    ChapterNext = "Next Chapter",
    ChapterPrevious = "Previous Chapter",
    SkipToBeginning = "Skip to Beginning",
    SkipToEnd = "Skip to End",
}

type ContextMenuProps = {
    onItemClick?: (
        itemClicked: ContextMenuItem | string
    ) => unknown | undefined;
    onClose?: () => unknown | undefined;
    onOpen?: () => unknown | undefined;
    isOpen: boolean;

    x?: number;
    y?: number;
};

const convertStringToElement = (
    item: ContextMenuItem | string,
    onClick?: ContextMenuProps["onItemClick"]
) => (
    <MenuItem key={item} onClick={() => onClick?.(item)}>
        {item}
    </MenuItem>
);

const ContextMenu = ({
    onItemClick,
    isOpen,
    onClose,
    onOpen,

    x,
    y,
}: ContextMenuProps) => {
    return (
        <Box position="absolute" left={x} top={y}>
            <Menu
                computePositionOnMount
                closeOnSelect
                closeOnBlur
                autoSelect
                matchWidth
                strategy="absolute"
                isOpen={isOpen}
                onClose={onClose}
            >
                <MenuList>
                    <MenuGroup title="File">
                        {[
                            ContextMenuItem.Save,
                            ContextMenuItem.SaveTo,
                            ContextMenuItem.Share,
                        ].map((item) =>
                            convertStringToElement(item, onItemClick)
                        )}
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup title="Navigation">
                        {[
                            ContextMenuItem.Chapters,
                            ContextMenuItem.ChapterNext,
                            ContextMenuItem.ChapterPrevious,
                            ContextMenuItem.SkipToBeginning,
                            ContextMenuItem.SkipToEnd,
                        ].map((item) =>
                            convertStringToElement(item, onItemClick)
                        )}
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup title="Miscellaneous">
                        {[
                            ContextMenuItem.Settings,
                            ContextMenuItem.ToView,
                            ContextMenuItem.ToHome,
                        ].map((item) =>
                            convertStringToElement(item, onItemClick)
                        )}
                    </MenuGroup>
                </MenuList>
            </Menu>
        </Box>
    );
};

export default ContextMenu;

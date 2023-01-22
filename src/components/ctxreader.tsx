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
import { IconType } from "react-icons/lib";
import {
    MdDownload,
    MdFirstPage,
    MdFolderOpen,
    MdHomeFilled,
    MdLastPage,
    MdLibraryBooks,
    MdRemoveRedEye,
    MdSave,
    MdSettings,
    MdShare,
    MdSkipNext,
    MdSkipPrevious,
    MdViewComfy,
} from "react-icons/md";
import { Icon } from "@chakra-ui/react";

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
    overflowRef: React.RefObject<HTMLElement | JSX.Element>;
    onClose?: () => unknown | undefined;
    onOpen?: () => unknown | undefined;
    isOpen: boolean;

    x?: number;
    y?: number;
};

const convertStringToElement = (
    _item: ContextMenuItem | readonly [ContextMenuItem, IconType] | string,
    onClick?: ContextMenuProps["onItemClick"]
) => {
    const item = Array.isArray(_item) ? _item[0] : _item;
    const icon = Array.isArray(_item) ? (_item[1] as IconType) : undefined;

    return (
        <MenuItem
            backgroundColor="0D1620"
            icon={icon ? <Icon as={icon} /> : undefined}
            key={item}
            onClick={() => onClick?.(item)}
        >
            {item}
        </MenuItem>
    );
};

const ContextMenu = ({
    overflowRef,
    onItemClick,
    isOpen,
    onClose,
    onOpen,

    x,
    y,
}: ContextMenuProps) => {
    if (!overflowRef.current) return null;

    return (
        <Menu
            closeOnSelect
            preventOverflow
            boundary={overflowRef.current as HTMLElement}
            closeOnBlur
            autoSelect
            matchWidth
            strategy="fixed"
            isOpen={isOpen}
            colorScheme="#0D1620"
            onClose={onClose}
        >
            <Portal>
                <MenuList
                    left={x}
                    top={y}
                    position={"absolute"}
                    backgroundColor="0D1620"
                >
                    <MenuGroup title="File" backgroundColor="0D1620">
                        {
                            // TODO: make this not shitty
                            (
                                [
                                    [ContextMenuItem.Save, MdDownload],
                                    [ContextMenuItem.SaveTo, MdFolderOpen],
                                    [ContextMenuItem.Share, MdShare],
                                ] as
                                    | readonly [ContextMenuItem, IconType][]
                                    | readonly ContextMenuItem[]
                            ).map((item) =>
                                convertStringToElement(item, onItemClick)
                            )
                        }
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup backgroundColor="0D1620" title="Navigation">
                        {(
                            [
                                [ContextMenuItem.Chapters, MdLibraryBooks],
                                [ContextMenuItem.ChapterNext, MdSkipNext],
                                [
                                    ContextMenuItem.ChapterPrevious,
                                    MdSkipPrevious,
                                ],
                                [ContextMenuItem.SkipToBeginning, MdFirstPage],
                                [ContextMenuItem.SkipToEnd, MdLastPage],
                            ] as
                                | readonly [ContextMenuItem, IconType][]
                                | readonly ContextMenuItem[]
                        ).map((item) =>
                            convertStringToElement(item, onItemClick)
                        )}
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup backgroundColor="0D1620" title="Miscellaneous">
                        {(
                            [
                                [ContextMenuItem.Settings, MdSettings],
                                [ContextMenuItem.ToView, MdViewComfy],
                                [ContextMenuItem.ToHome, MdHomeFilled],
                            ] as
                                | readonly [ContextMenuItem, IconType][]
                                | readonly ContextMenuItem[]
                        ).map((item) =>
                            convertStringToElement(item, onItemClick)
                        )}
                    </MenuGroup>
                </MenuList>
            </Portal>
        </Menu>
    );
};

export default ContextMenu;

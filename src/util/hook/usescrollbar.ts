import { RefObject, useMemo, useEffect } from "react";
import { StyleSheet, css } from "aphrodite";

const useScrollbar = (toApply: RefObject<HTMLElement>) => {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                scrollbar: {
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
                },
            }),
        [toApply]
    );

    useEffect(() => {
        if (!toApply.current) return;
        toApply.current.className += ` ${css(styles.scrollbar)}`;
    }, [toApply]);
}

export default useScrollbar;

import { useEffect, useMemo, useState } from "react";
import { StyleSheet, css } from "aphrodite";
import SearchSource from "components/searchsource";
import {invoke} from "@tauri-apps/api/tauri";

const Search = () => {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                search: {
                    backgroundColor: "#0D1620",
                    width: "100vw",
                    height: "100vh",
                },
            }),
        []
    );

    const [myManga, setManga] = useState(null);
    useEffect(() => {
        invoke("get_all_manga", { source: "MangaDex" }).then(console.log);
    }, []);

    return <div className={css(styles.search)}>
    </div>;
};

export default Search;

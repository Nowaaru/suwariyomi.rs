import { StyleSheet, css } from "aphrodite";
import { Text } from "@chakra-ui/react";
import type { Manga as MangaType } from "types/manga";

type MangaProps = {
    manga: MangaType;
};

const Manga = (props: MangaProps) => {
    const styles = StyleSheet.create({
        main: {
            flexBasis: 1,
            minWidth: "200px",
            maxWidth: "200px",
            marginLeft: "6px",
            marginRight: "6px",
            height: "fit-content",
            backgroundColor: "transparent" /* "#080e17", */,
            boxSizing: "border-box",
            borderRadius: "8px",
        },
        imagecontainer: {
            width: "100%",
            height: "100%",
        },
        image: {
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "8px",
            transition: "box-shadow 1s",

            ":hover": {
                boxShadow: "0px 0px 16px #000000",
                cursor: "pointer",
            }
        },
        title: {
            color: "whitesmoke",
            marginTop: "8px",
            marginBottom: "12px",
            maxHeight: "36px",
            textAlign: "start",
        },
    });

    const { manga } = props;
    const { covers, name } = manga;
    return (
        <div className={css(styles.main)}>
            <div className={css(styles.imagecontainer)}>
                <img className={css(styles.image)} src={covers[0]} />
            </div>
            <Text
                noOfLines={2}
                maxWidth="200px"
                color="whitesmoke"
                marginTop="8px"
                marginBottom="12px"
            >
                {name}
            </Text>
        </div>
    );
};

export default Manga;
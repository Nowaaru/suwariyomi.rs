import MangaPage from "components/mangapage";
import Lightbar from "components/lightbar";
import { StyleSheet, css } from "aphrodite";

const MangaPageTest = () => {
    const styles = StyleSheet.create({
        reader: {},
    });

    return (
        <div className={css(styles.reader)}>
            <MangaPage
                fit="comfortable"
                rounded
                radius={2}
                url="https://cdn.discordapp.com/attachments/760399994791657472/1014393229279514694/Kininatteru_Hito_ga_Otoko_Jyanakatta_-_Ch.18.1_-_The_Two_of_Them_Shopping_on_a_Day_Off_Five_Years_From_Now_Hopefully_-_1.png" // This is why we use a Blob.
            />
            <Lightbar vertical right onTabClick={(_, tab) => {
                console.log(`Clicked tab '${tab}'`);
            }} pages={24} />
        </div>
    );
};

export default MangaPageTest;

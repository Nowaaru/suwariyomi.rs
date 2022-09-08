import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";

import { invoke } from "@tauri-apps/api/tauri";
import { Manga } from "types/manga";

const myTestManga: Manga = {
    id: "12f92897-ad75-4c54-baed-b2834a9d8082",
    name: "Watashi no Yuri wa Oshigoto desu!",
    source: "MangaDex",
    covers: [
    { url: "https://mangadex.org/covers/12f92897-ad75-4c54-baed-b2834a9d8082/5d891dc0-1af9-4725-a003-64858d54bce9.jpg" }],

    chapters: ["test"],
    uploaded: 1700,
    added: 1760,
};

invoke("clear_manga").then(() => {
    invoke("insert_manga", { manga: myTestManga })
        .then(() => {
            console.log("Inserted manga!");
            invoke("get_mangas", {
                source: "MangaDex",
                ids: ["12f92897-ad75-4c54-baed-b2834a9d8082"]
            }).then((manga) => {
                console.log("Manga was found!");
                console.log(manga);
            }).catch((err) => {
                console.log("Manga not found.");
                console.error(err);
            });
        })
        .catch((err) => {
            console.error(err);
        });
});
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

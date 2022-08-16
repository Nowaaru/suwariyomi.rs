# suwariyomi.rs :crab:

`suwariyomi.rs` is a Manga reader created in TypeScript and Rust using the framework Tauri; inspired by the manga reader Tachiyomi.

### Corkboard

-   [x] Project Setup

    -   Start the project, change filestructure, and
        develop app foundation such as configure Vite,
        migrate to React, and create auxiliary modules
        for the Rust backend.
    -   Implement routers via React Router.

-   [x] Implement frontend styler.

    -   [x] Convert template page styling from CSS into to TS using the
            styler.

-   [x] Implement backend Download module.
    -   Write module that allows downloading from a source, returning a Download / Result object. Expecting good coding habits in this one.
-   [ ] Implement library page.

    -   Thinking of a more floaty design compared to Suwariyomi's rough, rigid,
        and serious design.

-   [ ] Return to backend, implement database support for Manga.

-   [ ] Implement CBZ file import handshake for frontend and backend.

    -   This file import structure should also be able to support `.zip` files (::from_zip, ::from_cbz).

-   [ ] Implement source import page with local manga at the bottom.

### 💭 Dreams

-   [ ] Boss Key

    -   Help those frisky ones get out of a pickle.

-   [ ] Customization

    -   [ ] Themes
    -   [ ] Plugins
    -   [ ] Extensible API

    -   This isn't likely. The majority of Suwariyomi's troubles came from
        attempting to implement user customization. If I program with these
        concerns in mind, maybe we can afford these.

<!--
1. No committing changes to both frontend and backend at the same time.
2. When committing to a side, prefix with either [frontend] or [backend].


-->

---

<sup>
   ・suwariyomi.rs also stands for suwariyomi resurrected! <br />
   ・stream rav's devilfruit smoothies <u><a href=https://open.spotify.com/track/4BfvLwWWzENjV4lMV51nH0?si=41228558fd3e4142>by clicking here.</a></u>

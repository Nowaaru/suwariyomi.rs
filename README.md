# suwariyomi.rs :crab:

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

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

-   [x] Implement library page.

    -   Thinking of a more floaty design compared to Suwariyomi's rough, rigid,
        and serious design.

-   [x] Return to backend, implement database support for Manga.

-   [x] Implement manga view page

-   [ ] Implement library search bar that sends data to /search page if search buttons are clicked

-   [ ] Implement canvas-based read component (for zooming/filters and all that good stuff)

-   [ ] Implement reading page

-   [ ] Implement third-party sources

-   [ ] Implement search page

-   [ ] Integrate source functionality (chapters, title, description, so on..) with view page

-   [ ] Implement settings and configuration

    -   I genuinely have no clue _how_ I'm going to do this without making it messy like Suwariyomi's. :(

-   [ ] Implement CBZ file import handshake for frontend and backend.

    -   This file import structure should also be able to support `.zip` files (::from_zip, ::from_cbz).

-   [ ] Implement history modal in Library

-   [ ] Implement source import page with local manga at the bottom.

### 💭 Dreams

-   [ ] Boss Key

    -   Help those frisky ones get out of a pickle.

-   [ ] Statistics Window

    -   How boned are you?

-   [ ] Use crate `serde_rusqlite` instead of whatever awful solution I have for databases

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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

---

<sup>
   ・suwariyomi.rs also stands for suwariyomi resurrected! <br />
   ・stream rav's devilfruit smoothies <u><a href=https://open.spotify.com/track/4BfvLwWWzENjV4lMV51nH0?si=41228558fd3e4142>by clicking here.</a></u>
   ・this project follows the <a href="https://github.com/all-contributors/all-contributors">all-contributors</a> specification. contributions of any kind welcome! <br />
</sup>

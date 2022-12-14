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

-   [x] Implement reading page

-   [x] Implement third-party sources

-   [x] Implement search page

-   [x] Integrate source functionality (chapters, title, description, so on..) with view page

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

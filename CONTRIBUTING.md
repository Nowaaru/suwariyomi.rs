# CONTRIBUTING

You want to become a contributor? Awesome! ✨

When contributing, you must follow a small set of guidelines.

-   **Commit Format**

    When writing a commit, it should follow the following format:

    `[optional: skip ci] <type>(field/optional scope): <description>`

    `[optional body]`

    `[optional footer(s)]`

    where `field` represents the area where the commit was made:

    -   frontend: typescript-centric commit
    -   backend: rust-centric commit
    -   mixed: commit contains both frontend and backend changes

    and `type` represents the type of commit you are making:

    -   build: affects npm and its files
    -   ci: changes the continuous integration process
    -   docs: changes documentation
    -   feat: adds a new feature
    -   fix: fixes a bug
    -   perf: performance-improving change but without changing general functionality
    -   refactor: changes that do not fix a bug or implement a new feature
    -   revert: removal of experimental / risky changes
    -   style: changes that do not change the code's meaning (whitespace, formatting, semis, etc)
    -   test: adds or modifies unit tests
    -   misc: changes that do not fit any of these categories (generally, should not be used)

    and lastly, the optional scope represents what exactly the commit changed:

    -   any component name
    -   any spcifier

    Please do not have a scope if it does not introduce any specicifity.
    `build`, `ci`, and `docs` do not require a field or scope.

    If a commit has a breaking change, please prepend an exclamation
    point behind the colon.

    A commit should never contain modifications to more than one
    field. there is only one exception: **if you are reflecting
    an interface change** e.g. updating the IPC to support a new
    command.

    If you are using the `meta` field, then please use `skip ci` unless necessary.
    When changing code, you should almost never use [skip ci].

    Examples:

    -   `chore(backend)`: capitalize table fields
    -   `fix(frontend)`: fix library infinite loop
    -   `[skip ci] docs(meta/readme)`: change line endings
    -   `feat(frontend/search)`: implement search history button

    Generally, follow the rules of: [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

-   **Pull Requests**

    You've finalized your changes and you're ready to make a
    pull request, so what's next?

    First, make sure that you've followed the layout of the
    placeholder. If the bare minimum isn't followed, the
    pull request will be closed.

    Please make sure all checks are passing and ensure that
    code quality is at least something more than a rotten
    spaghetti bowl.

    If your pull request has been in processing for a long time,
    feel free to mention reviewers at any time for a status update.

---

When you contribute to the repository, you get a shiny spot of
representation in the front page of the repository! You also
get a few badges depending on the kind of contribution you make.

###### Thank you! ❤️

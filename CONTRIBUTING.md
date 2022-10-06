# CONTRIBUTING

You want to become a contributor? Awesome! ✨

When contributing, you must follow a small set of guidelines.

-   **Commit Format**

    When writing a commit, it should follow the following format:

    `[optional: skip ci] <type>[field/optional scope]: <description>`

    where `field` represents the area where the commit was made:

    -   frontend: typescript-centric commit
    -   backend: rust-centric commit
    -   mixed: commit contains both frontend and backend changes
    -   meta: repository-centric commit

    A commit should never contain modifications to more than one
    field. there is only one exception: **if you are reflecting
    an interface change** e.g. updating the IPC to support a new
    command.

    It is optional to use square brackets, parenthesis, or curly
    brackets for the field.

    If you are using the `meta` field, then please use `skip ci` unless necessary.
    When changing code, you should almost never use [skip ci].

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

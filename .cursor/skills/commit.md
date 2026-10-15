# Commit message, identity, and push

`commit-picked` and `commit-staged` both follow this file. The calling skill chooses the paths. This file sets the message, the author, and the push.

## Message

Read `git log -8 --oneline` for the scope words this repo already uses. Write one subject line:

```text
type(scope): subject
type: subject
```

`type` is one of `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `ci`. Use `feat` for a new capability and `fix` for a bug correction. Add `scope` when the change sits in one area, such as `feat(admin):` or `fix(interviewer):`. Omit the parentheses when no scope fits.

`subject` is a short imperative phrase, lowercase, no trailing period.

## Identity

Read `git config user.name` and `git config user.email`. If either is empty, stop and say so. Do not invent an email and do not commit.

Wrap the calling skill's commit command so author and committer stay the configured user:

```bash
GIT_AUTHOR_NAME="$(git config user.name)" \
GIT_AUTHOR_EMAIL="$(git config user.email)" \
GIT_COMMITTER_NAME="$(git config user.name)" \
GIT_COMMITTER_EMAIL="$(git config user.email)" \
<the calling skill's commit command>
```

Pass the message with a heredoc. Do not add a `Co-authored-by` trailer. Do not change git config. Do not use `--no-verify` or `--amend`.

Done when `git log -1 --format='%an <%ae>'` prints the configured name and email.

## Push

```bash
git push -u origin HEAD
```

Done when `git status` shows the branch in sync with origin. Tell the user the commit subject, the author line, and the remote branch.

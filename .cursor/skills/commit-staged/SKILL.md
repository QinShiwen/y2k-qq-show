---
name: commit-staged
description: >-
  Show the staged files, draft a Conventional Commit they can edit, then
  commit only the index as the configured git user and push to origin after
  they say okay. Use when the user has staged changes, says staged, or asks
  to commit what is staged.
---

# Commit staged files

The staged index is the selection. Restate it, draft the message, and wait. Commit and push happen only after they accept the message. The commit contains the index and nothing else.

## 1. Restate the staged files

Read the index with `git diff --cached --name-only` and `git diff --cached`.

If the index is empty, stop and tell the user to stage the files they want in this commit.

For each staged file, show:

- the path
- a one-line summary of the staged diff

Leave unstaged and untracked files out of the list.

## 2. Draft the message

Read [commit.md](../commit.md) and follow **Message**. Show the staged file list and that one line together. Then stop.

## 3. Wait for the message they want

- They rewrite the message: use their words, show the staged file list and the new message again, and stop.
- They add a file: `git add -- <path>`, re-read the index, regenerate the message, and show both again. Stop.
- They drop a file: `git restore --staged -- <path>`, re-read the index, regenerate the message, and show both again. Stop.
- They accept it ("okay", "no problem", "go ahead", "yes"): re-read `git diff --cached --name-only`. If the index differs from the list on screen, show the new list and stop. If it matches, go to step 4 with the message on screen. If they typed their own message in the same reply, use their words verbatim.

## 4. Commit the index

Follow **Identity** in [commit.md](../commit.md).

Do not `git add`. A plain `git commit` records the index only:

```bash
git commit -m "$(cat <<'EOF'
Accepted message here.

EOF
)"
```

## 5. Push

Follow **Push** in [commit.md](../commit.md).

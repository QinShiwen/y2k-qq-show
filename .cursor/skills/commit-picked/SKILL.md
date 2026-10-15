---
name: commit-picked
description: >-
  Commit the files the user names by path. Show that selection, draft a
  Conventional Commit they can edit, then commit only those paths as the
  configured git user and push to origin after they say okay. Use when the
  user names files, lists paths, or says which changes to include.
---

# Commit picked files

The paths the user names are the selection. Restate them, draft the message, and wait. Commit and push happen only after they accept the message. The commit records the working-tree content of those paths and leaves every other staged file unstaged in the index.

## 1. Restate the named files

Use only the paths the user named. If they named none, ask which files to include and stop.

For each path, show:

- the path
- a one-line summary of its working-tree diff (`git diff -- <path>` and `git diff --cached -- <path>`)

If a named path has no staged, unstaged, or untracked change, say so and stop.

## 2. Draft the message

Read [commit.md](../commit.md) and follow **Message**. Show the named file list and that one line together. Then stop.

## 3. Wait for the message they want

- They rewrite the message: use their words, show the file list and the new message again, and stop.
- They add or drop a path: update the named list, regenerate the message, and show both again. Stop. Do not `git add` here.
- They accept it ("okay", "no problem", "go ahead", "yes"): go to step 4 with the message on screen. If they typed their own message in the same reply, use their words verbatim.

## 4. Commit those paths

Follow **Identity** in [commit.md](../commit.md).

If a named path is untracked, `git add -- <that path>` first. Do not `git add` any other path.

Commit with paths after `--`, which commits only those paths:

```bash
git commit -m "$(cat <<'EOF'
Accepted message here.

EOF
)" -- path1 path2
```

## 5. Push

Follow **Push** in [commit.md](../commit.md).

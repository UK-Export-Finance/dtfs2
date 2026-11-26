# Merging releases back to main

This guide covers merging release changes back to `main`, including the release
commit that Release Please tagged. It also covers repairing missing release
ancestry when the file changes have already reached `main`.

For environment deployment instructions, see [Deployments](./deployments.md).

## Quick checklist: all steps in order

Use this after the release tag exists. Replace `4.0.0` throughout with your
release version. Run one step at a time, not the entire checklist at once.
The explanations and troubleshooting below cover each step in more detail.

1. **Check that your worktree is clean and no merge is in progress.**

   ```bash
   git status
   ```

   Stop if there is unrelated work or an unfinished merge.

2. **Fetch, confirm the tag, and create your back-merge branch from main.**

   ```bash
   git fetch origin --tags
   git show --no-patch --format=fuller v4.0.0
   git switch -c chore/merge-4.0.0 origin/main
   ```

   Stop if any command fails. If the branch name already exists, choose a new
   name and use that name in the push command below.

3. **Start a real merge of the release tag.**

   ```bash
   git merge --no-ff --no-commit v4.0.0
   git status
   ```

   Conflicts mean the merge is paused, not finished. Continue with step 4.
   If Git says `Already up to date`, skip step 4 and verify step 5.
   Stop for any other merge error.

4. **Resolve conflicts, review the result, and complete the merge commit.**

   Using vscode, fix the merge conflicts and use the `+` to stage the files
   into the commit. Then run the command below

   ```bash
   git commit -m "chore(merge): merge release-4.0.0 to main"
   ```

   **Do not push before this succeeds. The previous failed attempt had file
   changes but no completed release merge commit.**

5. **Verify the release ancestry and review the proposed changes.**

   ```bash
   git merge-base --is-ancestor v4.0.0 HEAD
   echo $?
   git show --no-patch --format='%H%nParents: %P%n%s' HEAD
   git diff --stat origin/main...HEAD
   git diff origin/main...HEAD
   ```

   The exit code printed immediately after the ancestry check must be **0**.
   Otherwise stop: the repair is not verified. A newly created merge commit
   should have two parents. If no merge was needed and the tag is already an
   ancestor of `origin/main`, no ancestry repair PR is necessary.

6. **Push, open the PR to main, and select Create a merge commit.**

   ```bash
   git push -u origin chore/merge-4.0.0
   ```

   Title: `chore(merge): merge release-4.0.0 to main`.
   Do not squash or rebase. If GitHub says there is nothing to compare, use the
   troubleshooting section below instead of adding dummy changes.

7. **Verify main after the PR is merged and inspect release automation.**

   ```bash
   git fetch origin
   git merge-base --is-ancestor v4.0.0 origin/main
   echo $?
   ```

   The exit code must be **0**. Check the latest **Automated release** run and
   the generated release PR. It must not propose the already published version
   again. The next version depends on unreleased changes; it is not guaranteed
   to be a patch release.

## Why the Git history matters

Release Please needs to find the previous release commit in the history of its
target branch. Having the same files or version number on `main` is not enough.
The tagged commit itself must be an ancestor of `main`.

The [Automated release workflow](../.github/workflows/publish.yml) runs on both
`main` and eligible release branches. A release created on a release branch
therefore needs its tagged commit merged back to `main`.

If that history is missing, Release Please can scan older commits again, include
already released changes, and encounter an old `Release-As` override. This can
produce a release PR for a version that already exists.

### What happened with 4.0.0

The PR [#5158](https://github.com/UK-Export-Finance/dtfs2/pull/5158) was merged
using a merge commit, not squash and merge. Its source branch nevertheless did
not contain the `v4.0.0` tagged commit in its ancestry.

The source branch had commits named `chore(merge): merge release-4.0.0 to main`,
but those commits had only one parent. Their messages did not make them Git
merge commits. The available history does not establish exactly which local
command or tool action caused the release ancestry to be omitted.

The repair was to merge the actual `v4.0.0` tag into a branch based on `main`,
resolve the conflict, and complete the merge commit. The resulting repair commit
had two parents, including the tagged release commit.

**Selecting Create a merge commit on GitHub cannot restore ancestry that is
already missing from the PR's source branch. Check the local merge result before
pushing.**

## Before starting

The examples below use release `4.0.0`. Replace the version, tag, branch, and PR
title with the release you are working on.

Run commands from the repository root. Start with a clean worktree:

```bash
git status
```

Commit or otherwise safely set aside unrelated work before proceeding. If Git
reports an existing merge in progress, complete or deliberately abort that merge
before starting another one.

Fetch the current branches and tags:

```bash
git fetch origin --tags
```

For a completed release, confirm the tag exists and inspect its commit:

```bash
git show --no-patch --format=fuller v4.0.0
```

Do not delete or move an existing release tag to fix this problem.

## Completed release: merge the actual tag

This is the explicit procedure used to restore the missing 4.0.0 ancestry. Use
it after the release tag exists, even if some or all release file changes were
already merged back.

### 1. Create a branch from current main

```bash
git switch -c chore/merge-4.0.0 origin/main
```

If that branch name already exists, choose a new name, such as
`chore/restore-4.0.0-ancestry`. Do not reset or overwrite an existing branch.

### 2. Merge the tagged commit

```bash
git merge --no-ff --no-commit v4.0.0
```

`--no-ff` preserves a merge commit when a merge is needed. `--no-commit` pauses
before committing so that the result can be reviewed.

Read the output before continuing:

- If Git reports conflicts, follow the next section.
- If Git reports that it stopped before committing, review and complete the
  merge as described below.
- If Git says `Already up to date`, check the ancestry in step 4. No new merge
  commit is needed if the tagged commit is already included.
- If the merge fails for another reason, resolve that error first.

### 3. Resolve conflicts and finish the merge

Inspect the merge state and unresolved files:

```bash
git status
git diff --name-only --diff-filter=U
git rev-parse --verify MERGE_HEAD
```

For a pending merge of this tag, `MERGE_HEAD` should identify the commit shown
by `git rev-parse 'v4.0.0^{commit}'`. If `MERGE_HEAD` cannot be found, stop:
there is no pending merge to complete. Making an ordinary commit at that point
will not restore the missing parent.

Resolve each conflict, preserving both intended release changes and newer
`main` changes. Stage each resolved file explicitly, then inspect the result:

```bash
git diff --cached
git diff --check
git status
```

Do not blindly select all incoming or all current changes.

#### If package-lock.json conflicts

For an ancestry-only repair, keeping `main`'s lockfile is appropriate only after
checking that it already represents the intended dependency manifests. It is
not a general conflict-resolution rule for every release merge.

If that condition is met, the following deliberately replaces the conflicted
lockfile, including any edits to it, with the version from the pre-merge `HEAD`:

```bash
git restore --source=HEAD --staged --worktree -- package-lock.json
```

Otherwise resolve the dependency differences using the intended package
manifests and regenerate the lockfile with the repository's npm workflow.
Review the resulting dependency changes and run their relevant checks.

#### Complete the pending merge

After all conflicts are resolved and staged, run:

```bash
git commit -m "chore(merge): merge release-4.0.0 to main"
```

For a repair PR, use a descriptive message such as
`chore(merge): restore release-4.0.0 ancestry on main`.

Do not push while the merge is still paused. A conflicted merge does not move
the branch tip until the merge commit is created.

### 4. Verify the ancestry before pushing

Run this check on the branch that will be the PR source:

```bash
if git merge-base --is-ancestor v4.0.0 HEAD; then
  echo "PASS: release ancestry is included"
else
  echo "STOP: ancestry check failed; investigate before pushing"
fi
```

Proceed only on `PASS`. A failure means the tag is not an ancestor, or Git
encountered an error that must be investigated.

For a newly created merge commit, inspect its parents:

```bash
git show --no-patch --format='%H%nParents: %P%n%s' HEAD
```

The merge commit should have two parents. Parent count alone is not sufficient:
a merge of `main` into your branch also has two parents, but does not prove that
the release tag is included. The ancestry check above is the decisive check.

Review the PR's proposed file changes and run checks relevant to those changes:

```bash
git diff --stat origin/main...HEAD
git diff origin/main...HEAD
```

### 5. Push and merge the PR

Push your chosen branch, for example:

```bash
git push -u origin chore/merge-4.0.0
```

Open a PR targeting `main`. Suggested titles:

- Normal back-merge: `chore(merge): merge release-4.0.0 to main`
- Ancestry repair: `chore(merge): restore release-4.0.0 ancestry on main`

Use **Create a merge commit** when merging the PR. Do not squash or rebase the
PR, because that can omit the release commit's ancestry.

### 6. Verify main after merging

```bash
git fetch origin
if git merge-base --is-ancestor v4.0.0 origin/main; then
  echo "PASS: main includes the tagged release"
else
  echo "STOP: ancestry check failed; investigate before releasing"
fi
```

Then inspect the latest **Automated release** workflow run and the generated
release PR. Confirm it no longer proposes an already published version or
duplicates previously released changes.

The next version is not necessarily `4.0.1`. Conventional commits determine the
bump: unreleased features can require a minor release, and breaking changes can
require a major release. If there are no releasable changes, a new release PR
may not be needed.

## Release changes before the tag exists

You can still create an intermediate branch from `origin/main`, merge
`origin/release-4.0.0` into it, resolve conflicts, complete the merge, and use
**Create a merge commit** for its PR. Use the same pending-merge and ancestry
checks, substituting `origin/release-4.0.0` for the tag.

However, a later release commit is not included in an earlier back-merge.
**After the tag is created, repeat the completed-release procedure and verify
that the actual tag is an ancestor of `main`.**

## Troubleshooting

### GitHub says there is nothing to compare

First check whether the merge is still unfinished:

```bash
git status
git log --oneline origin/main..HEAD
```

During the 4.0.0 repair, the branch still pointed at `main` because a lockfile
conflict had not been resolved and the merge had not been committed. Pushing
that branch did not push a completed repair. Finish step 3, verify step 4, and
push again.

If the merge is committed and pushed, the ancestry check passes, but there are
no file differences, GitHub may still refuse to create a PR. This is a genuine
ancestry-only change. Arrange an authorised maintainer merge through the
repository's branch-protection process. Do not add dummy changes, bypass
protections, or force-push `main`.

### The release PR still proposes the old version

Check the ancestry on the fetched `origin/main`, not just your local repair
branch. A local repair does not affect Release Please until it reaches `main`.

Check that the latest Automated release run used the repaired `main` commit
and completed successfully. Inspect its logs before changing release settings.
Closing or renaming the generated PR alone does not repair missing ancestry.

Do not manually change the release manifest to the desired next version, move
the published tag, or add another `Release-As` override as a substitute for
repairing the history.

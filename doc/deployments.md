# Deployments

This document describes how to deploy to the development, feature, staging, and
production environments.

## Development and feature environments

Development and feature environments are deployed automatically each day:

- Development deployments start at 19:00.
- Feature deployments start at 20:00.

Both deployments use the `main` branch, so they include the changes present on
`main` when the deployment starts. Changes merged after a deployment starts
will be included in the next deployment. These environments have no locks, so
no additional steps are required.

Deployments do not retry automatically. If a deployment fails, rerun the failed
jobs manually.

For a manual deployment, merge or push your changes to the `dev` branch and
push the branch to GitHub. This triggers both the development and feature
deployments. Cancel the deployment you do not need, or run them one at a time
and monitor each job.

For more information, see [`deployment.yml`](../.github/workflows/deployment.yml)
and [`feature.yml`](../.github/workflows/feature.yml).

## Staging

Staging deployments use the release workflow in
[`release.yml`](../.github/workflows/release.yml). Only release branches are
deployed to staging. Their names use the `release-*` format, for example,
`release-4.0.0`.

To start a release:

1. Create a release branch from the desired commit (for example, from `main`).
2. Push the branch to GitHub. This starts a QA run automatically.
3. If QA succeeds, the deployment job starts. If QA fails, investigate and
   rerun the failed jobs.
4. Before deployment, delete the lock on the `Digital-Test` resource group.
   Deployments will fail if the lock is present. You need Owner permissions on
   the resource group to remove it.
5. Approve each job in the deployment pipeline.

## Production

Production follows the same release workflow as staging, using release
candidates. Only release branches ending in `-rc` are deployed to production.
Their names use the `release-*-rc` format, for example, `release-4.0.0-rc`.

To start a production release:

1. Create a release-candidate branch from the release branch you want to deploy
   (for example, create `release-4.0.0-rc` from `release-4.0.0`).
2. Push the branch to GitHub. This starts a QA run automatically.
3. If QA succeeds, the deployment job starts. If QA fails, investigate and
   rerun the failed jobs.
4. Before deployment, delete the lock on the `Digital-Prod` resource group.
   Deployments will fail if the lock is present.
5. Approve each job in the deployment pipeline.

## General tips and facts

- The web app deployment jobs run one at a time to reduce flakiness.
- If the deployment cleanup step fails while cleaning up a slot, manually
  delete the slot from the resource group in Azure to avoid unnecessary cost
  and resource usage. The slot is labelled **App Service (slot)**.
- To test custom code or a specific point in a release (for example, for a
  penetration test), create a release branch from that point. For example,
  `release-4-for-pen-test`.
- If you create a release branch from the wrong point, delete it in GitHub and
  create a new one.

## Purge workflow

The [`purge.yml`](../.github/workflows/purge.yml) workflow runs daily at
23:00. It removes older container image tags from the non-production Azure
Container Registries used by development, staging, and feature environments.
The retention age is configured by `ACR_PURGE_NONPROD_DAYS`; the purge keeps
the three most recently modified matching tags.

The workflow cleans up images for the portal, GEF, Trade Finance Manager, and
API services. It does not deploy applications. Purging old images helps limit
registry storage use and its associated costs while retaining recent images.

Check the workflow run in GitHub Actions regularly. If a purge fails, old
images may remain in the registry, so storage use can continue to grow. The
workflow sends a Microsoft Teams notification after a successful purge; check
the workflow run directly if a registry does not receive a notification.

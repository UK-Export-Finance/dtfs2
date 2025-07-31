# GHA - CI/CD Pipeline 🚀

This information provides an overview of the CI/CD pipeline structure, naming
conventions, workflow triggers, and secrets management practices in place for
the deployment of services in different environments. 🛠️🔒🌐

## Subscriptions 📑

There are two subscriptions, to manage costs:

- Dev/Test 🧪
- Prod 🌐

There are three environments, in order of pipeline deployment and testing:

- Dev - QA (P2V2) 🛠️
- Staging - UAT + Pen tests (P3V2) 🛡️
- Prod - Live (P3V2) 🚀

Workflows for each environment are triggered when the corresponding branch is
updated. For the `dev` environment, this happens on an update of `dev`, after
tests have passed. Environment workflows ensure we've got the right
infrastructure set up and correctly configured, plus any environment variables
and secrets set as needed.

## Naming Conventions 🏷️

In general, naming conventions are: `tfs-environment-component` (in order of
magnitude, so "service, environment, component"). That means a list of things
will sort alphabetically into blocks of items that work together (e.g., all
items that are part of a given environment).

A couple of places this works are:

- GitHub secrets: you can scroll through the list and find out what secrets are
  set for a given environment.
- Azure App Services: you can see the environments as blocks in the list and
  find the services deployed in a given environment.

## Pipeline Overview 📊

At a high-level, the pipeline works by building Docker container images
(repositories) with various tags associated with them (artefacts), which are
then saved under specific ACR (Azure Container Registry) accounts, i.e.,
`tfsdev`, `tfsstaging`, and `tfsprod`.

1. Code is pushed to the `main` branch.
2. Infrastructure is set up (if any changes) `_infrastructure`, container images
   are built, pushed, and deployed `_deployment` with correct tags (artefacts).
3. Merging to the `infrastructure` branch triggers a refresh of supporting
   infrastructure (Service Plan, ACR) when a file change is detected in the
   `infrastructure.yml` file.

## Deployment 🚚

Deployments are initiated by a `push` to the respective branch i.e. `dev`,
`staging` and `prod`. When `main` is merged to either of the above deployment
branch this will trigger the respective GitHub Action (GHA) YML pipeline.

## Secrets 🔒

To add a new secret, set it in GitHub Secrets (under repository settings), then
add it to each of the environment workflows. To manage secrets across multiple
environments, an automation script has been created under `/secrets/GitHub`.

## Using AZ Command-Line Locally 🖥️

To run Azure CLI commands locally, you'll need to install the `az` CLI.
Additionally, you'll need:

- The Front Door extension: `az extension add --name front-door`

---

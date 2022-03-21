### GHA - CI/CD Pipeline

## Directory structure
Workflow directory structure has segregated as per workflow categories.
- Environment: Runtime environments `dev`, `staging` and `production`
- Infrastructure: DNS and IaC
- Pipeline: Artifacts are built from `latest` to `dev` and pushed to `tfsdev` ACR.
- PR: Build and push artifact to `tfsdev` followed by PR test.
- QA: Code level quality check

## Subscriptions
There are two subscriptions, to manage costs:

 * Dev/Test
 * Prod

## Environments
There are three environments, in order of pipeline deployment and testing.

 * Dev - QA (P2V2)
 * Staging - UAT + Pen tests (P3V2)
 * Prod - Live (P3V2)

Workflows for each environment are triggered when the corresponding branch is updated.
For the `dev` environment this happens on update of `dev`, after tests have passed.
Environment workflows ensure we've got the right infrastructure set up and correctly configured, plus any environment variables and secrets set as needed.

## Naming conventions
In general, naming conventions are: tfs-`environment`-`component` (in order of magnitude, so "service, environment, component").
That means a list of things will sort alphabetically into blocks of items that work together (e.g., all items that are part of a given environment).

A couple of places this works are:
 * GitHub secrets: you can scroll through the list and find out what secrets are set for a given environment
 * Azure App Services: you can see the environments as blocks in the list and find the services deployed a given environment

## Pipeline overview
At a high-level, the pipeline works by building docker container images (repositories) with various tags associated to it (artifacts)
which then are saved under specific ACR (Azure container registry) account i.e., `tfsdev`, `tfsstaging` and `tfsprod`.

 * Code is pushed to the `main` branch.
 * API tests and E2E tests are then executed, E2E tests are executed on multiple machines.
 * Various PR tests are then executed, if successful then we deploy to `dev`.
 * Infrastructure is setup (if any changes) respective `Infrastructure.yml`, container images are built `Pipeline` with correct tags (artifacts), promoted to the containers (`Deploy.yml`)
 * Merging to the `main` branch triggers a refresh of supporting infrastructure (Service Plan, ACR), when a change has been detected in `.github/workflows/Infrastructure/infrastructure.yml` file.

## Deployment
Deployment is triggered by webhooks from the ACR to the web app Service instances.
When an image is pushed, a web app service restart is required, this is handled by the GitHub Actions workflows.

## Using AZ command-line locally
To run Azure CLI commands locally you'll need to install the az cli, additionally you'll need:
 * The Front Door extension: `az extension add --name front-door`
## Pipeline overview

At a high-level, the pipeline works by building container images and promoting them between registries:

 * code is pushed to master
 * container images are built and pushed to the dev registry
 * api tests and e2e tests are run
 * if tests pass, the images are promoted from the dev registry to the test registry
 * This process will need to be extended for production deployment
 * Pushing code to the 'demo' branch (this can be a simple copy of the main branch) triggers a promotion to the registry for the demo environment - this is to ensure that demo remains stable whilst normal work continues.

### Deployment

Deployment is triggered by webhooks from the container registries to the App Service instances. This means that Whenever an image is pushed, a rolling deploy should be triggered automatically.

### Environments

Individual workflows for each environment are triggered in parallel when code is pushed to the 'infrastructure' branch (this can be a simple copy of the main branch).

Environment workflows ensure we've got the right infrastructure set up and correctly configured, plus any environment variables and secrets set as needed.

### Secrets

To add a new secret, set it in Github Secrets (under repository settings), then add it to each of the environment workflows.

### Naming conventions

In general, naming conventions are: tfs-`environment`-`component` (in order of magnitude, so "service, environment, component"). That means a list of things will sort alphabetically into blocks of items that work together (e.g. all items that are part of a given environment).

A couple of places this works are:
 * Github secrets: you can scroll through the list and find out what secrets are set for a given environment
 * Azure App Services: you can see the environments as blocks in the list and find the services deployed a given environment

Other approaches are available, but this seems a reasonable one for now.

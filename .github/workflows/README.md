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
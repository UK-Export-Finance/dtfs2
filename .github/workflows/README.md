## Pipeline overview

At a high-level, the pipeline works as follows:

 * code is pushed to master
 * container images are built and pushed to the dev registry
 * api tests and e2e tests are run
 * if tests pass, the images are promoted from the dev registry to the test registry

Deployments are triggered by webhooks from the container registries to the App Service instances. When an image is pushed, it should trigger a rolling deploy automatically.

Individual workflows for each environment are triggered in parallel when code is pushed to the 'infrastructure' branch (this can be a straight copy of the main branch).

Environment workflows ensure we've got the right infrastructure set up and correctly configured, plus any environment variables and secrets set as needed.

# test-hook-api

:warning: This service could be deleted

This module is used to plug some gaps in the pipeline.

Currently contains a single trigger for typeB messages, to be put in our azure fileshare.

## Running locally

```shell
docker-compose up
```

Alternatively, every service can be started from the root directory (`docker-compose up`).

## This service could be deleted

At the start of the project, the requirement was to submit deals to another system called Workflow. "TypeB" is a Workflow service.

We have TFM now - so no need to integrate with Workflow/TypeB.

This module might be able to be deleted without issues.

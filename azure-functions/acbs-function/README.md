# ACBS - Azure Function App ⚡️

Azure Functions are not platform-agnostic and work exclusively within the Azure cloud ecosystem. They are accessed through Azure's serverless compute service.

## Local Development :computer:

Azure Functions can be run locally on port 7071 using the Azure Functions Core Tools. This local environment enables testing and debugging before deploying to Azure.

## Orchestrating with HTTP trigger Function :electric_plug:

Durable Functions are initiated by an HTTP trigger function, often referred to as `acbs-http`. This starter function triggers the execution of durable orchestrator functions.

## Durable Functions 🔄

Durable Functions are an extension of Azure Functions, allowing for stateful orchestrator functions within a serverless environment. These orchestrator functions enable the orchestration of various functions over extended time periods. Orchestrations can persist their state, even in the event of disruptions.

## Application Pattern :rocket:

As of October 7, 2021, two application patterns are primarily used for durable functions execution:

- **Function Chaining (Linear)** 🔄 - This pattern involves executing functions sequentially, one after the other, in a linear fashion.
- **Fan Out - Fan In (Parallel)** ⚙️ - In this pattern, functions are executed in parallel (fan out) and their results are then aggregated (fan in) for further processing.

## Queue Storage :file_folder:

Orchestrator functions utilize Azure Storage Queues to store and manage their state. Cleaning up queues when necessary is important to prevent unnecessary executions.

Azure Functions and Durable Functions play a critical role in orchestrating tasks, interfacing with external services (such as Mulesoft), and automating workflows within the Azure cloud ecosystem.

If you have any specific questions or need further assistance with your development process, please don't hesitate to ask! :memo:

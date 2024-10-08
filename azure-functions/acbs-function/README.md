# ACBS - Azure Function App ⚡️

Azure Functions are not platform-agnostic and work exclusively within the Azure cloud ecosystem.
They are accessed through Azure's serverless compute service.

## Jargons ✏️

### Deal records

- DMR: Deal master record
- DIR: Deal investor record
- DGR: Deal guarantee record

### Facility records

- FMR: Facility master record
- FIR : Facility investor record
- FCR : Facility covenant record
- FGR : Facility guarantee record
- FCVT : Facility code value transaction
- FLR : Facility loan record
- FFFR: Facility fixed fee record

## Local Development :computer:

Azure Functions can be run locally on port 7071 using the Azure Functions Core Tools. This local environment enables testing and debugging before deploying to Azure.

### Running Durable Functions locally using Azure Functions Core Tools

This guide provides detailed steps to run Durable Functions locally using Azure Functions Core Tools with Node.js.
Durable Functions is an extension of Azure Functions that lets you write stateful functions in a serverless environment.
By running it locally, you can develop and test your functions before deploying them to Azure.

#### Prerequisites

Before you start, ensure you have the following installed on your machine:

- Azure Functions Core Tools
- Azure storage emulator or link to Azure storage account (local.settings.json)
- For cross-platform: Install Azurite
- For Windows: Download Azure Storage Emulator

#### Configuring Local Settings

Update your `local.settings.json` to configure the Azure Storage connection string.
This file holds the settings used when running your project locally.

```javascript
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "...",
    "FUNCTIONS_WORKER_RUNTIME": "node"
    "AzureWebJobsFeatureFlags": "EnableWorkerIndexing"
  }
}
```

#### Running the Functions Locally

- Start Azure functions core tool by

```bash
func start
```

#### Execute `acbs` DOF

- Send an empty payload to `acbs` DOF for connection test

```bash
curl -X POST http://localhost:7071/api/orchestrators/acbs
```

## Orchestrating with HTTP trigger Function :electric_plug:

Durable Functions are initiated by an HTTP trigger function, often referred to as `acbs-http`. This starter function triggers the execution of durable orchestrator functions.

## Durable Functions 🔄

Durable Functions are an extension of Azure Functions, allowing for stateful orchestrator functions within a serverless environment.
These orchestrator functions enable the orchestration of various functions over extended time periods.
Orchestrations can persist their state, even in the event of disruptions.

## Application Pattern :rocket:

As of October 7, 2021, two application patterns are primarily used for durable functions execution:

- **Function Chaining (Linear)** 🔄 - This pattern involves executing functions sequentially, one after the other, in a linear fashion.
- **Fan Out - Fan In (Parallel)** ⚙️ - In this pattern, functions are executed in parallel (fan out) and their results are then aggregated (fan in) for further processing.

## Queue Storage :file_folder:

Orchestrator functions utilize Azure Storage Queues to store and manage their state. Cleaning up queues when necessary is important to prevent unnecessary executions.

Azure Functions and Durable Functions play a critical role in orchestrating tasks, interfacing with external services (such as Mulesoft), and automating workflows within the Azure cloud ecosystem.

If you have any specific questions or need further assistance with your development process, please don't hesitate to ask! :memo:

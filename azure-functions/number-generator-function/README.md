# Number Generator - Azure Function App ⚡️

Azure Functions is a serverless compute service provided by Microsoft Azure. It allows developers to build and deploy small pieces of code called functions without the need to manage infrastructure. An Azure Functions app is a container that hosts multiple individual functions.
Azure Functions are event-driven, meaning they execute in response to various triggers such as HTTP requests, timers, message queues, database updates, or file uploads. Each function is designed to perform a specific task or execute a particular piece of code.

Durable orchestrated functions (an extension of Azure functions) that enables developers to write stateful and long-running workflows in a serverless environment. It provides a way to define complex workflows or orchestrations as code, allowing you to coordinate and manage multiple function invocations over time. We have employed DOF and DAF (durable activity function) which works in tandem to fetch latest `maskedId` or a number to be used either for a `deal` or a `facility`.

Durable Orchestrations Functions allow you to define a workflow by writing a single orchestrator function, which acts as the entry point for your workflow. This orchestrator function can call other functions, both regular Azure Functions and other orchestrator functions, and control their execution order, handle input and output, and manage the state of the workflow. We have employed **Fan-out/fan-in** pattern Orchestrations can parallelize work by invoking multiple functions in parallel and aggregating their results when they complete. This allows for efficient processing of large volumes of data or parallelizing tasks across multiple resources.

Azure functions and Azure storage provides a comprehensive and a stable environment where input, output and execution steps are stored in the provided Azure storage tables and queues.

## Execution 🚀

### 1. HTTP starter function

The numberGeneratorHttp function is defined as an async function that takes context and req (request) as parameters. This function is the entry point for the `HTTP` trigger of the Azure Function.
Inside the function, a client object is created using `df.getClient(context)`. This client is used to interact with the Durable Functions framework.

The `client.startNew` method is called to start a new instance of the specified Durable Function.
The `req.params.functionName` parameter refers to the name of the Durable Function to be started. The `undefined` parameter represents the instance ID, which is left `undefined` here, letting the framework generate a new unique ID.
The `req.body` contains the request body data, which is passed as input to the Durable Function.

The function returns the result of `client.createCheckStatusResponse`, which generates a response object with a URL that can be used to check the status of the Durable Function instance. This URL is based on the current context.bindingData.req and the generated instanceId.

If an error occurs during the execution of the function, it is caught in a catch block, and an object containing the error is returned.

### 2. DOF

The code exports an orchestrator function using `df.orchestrator` and the generator function syntax (function\*). This function is named numbergenerator. Inside the numbergenerator function, it starts by logging a message indicating that the number generator is being invoked.

The code checks if certain required environment variables `(APIM_MDM_URL, APIM_MDM_KEY, and APIM_MDM_VALUE)` are present. If any of these variables are missing, it throws an error indicating the missing environment variables.

Next, it checks if there is any input provided to the orchestrator function using `context.df.getInput()`. If no input is provided, it throws an error indicating the void input. The code extracts the `entityType` property from the input.

It checks if the entityType matches specific values defined in the `CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE` object. If the entityType does not match any of the expected values, it throws an error indicating the void entityType argument specified.

Inside a `try-catch` block, the code calls an activity function named 'activity-get-number-from-generator' using context.df.callActivityWithRetry. It passes the retryOptions object and an object containing the `entityType` as input to the activity function. If the activity function is executed successfully, the result is returned.

If an error occurs during the execution of the activity function, the catch block is triggered. It logs an error message and returns an object with the num property set to 'ERROR_NUM_GENERATOR' and the error property set to the caught error. The orchestrator function acts as the coordinator for the workflow, making decisions, calling activities, and handling errors. It uses generator syntax (`function*`) to enable the use of yield statements for asynchronous operations within the function.

### 3. DAF

The code defines a constant `MAX_NUMBER_OF_TRIES` with a value of 5, which represents the maximum number of tries to generate a number before exiting the loop. The `getNumberFromGenerator` function is defined as an async function that takes context as a parameter. This function is not intended to be invoked directly but is triggered by an orchestrator function (DOF).

Inside the function, the `entityType` is extracted from context.bindingData. Depending on the value of `entityType`, the `numberType` and `checkAcbs` variables are set accordingly. These variables are used to determine the specific type of number generation and the API function to check if the generated number is available.

A while loop is implemented to generate a number and check its availability. The loop continues until `numberIsAvailable` is true or the `loopCount` reaches the maximum number of tries. Within the loop, it logs the execution count of the number generator.

The number is generated by calling `numberGeneratorController.callNumberGenerator` and passing the numberType as an argument.

If the generated number is falsy, meaning it was not successfully generated, it throws an error indicating a void response. It logs a success message if the number is successfully generated. It calls the checkAcbs API function to check the availability of the generated number. The result is stored in the status variable.

If the status is `404` (indicating the number is available), `numberIsAvailable` is set to true.
The loopCount is incremented after each iteration. Once the loop exits, the function returns an object with the generated number (`ukefId` property).

This activity function is responsible for generating a number based on the specified `entityType` and checking its availability using an API function. It retries the number generation process a maximum of `5` times or until a number is successfully generated and available.

## Output 📝

Upon a successful execution of the durable function, a `ukedId` is returned in response as a integer.

```javascript
{
  "ukefId": 003001234
}
```

Where by the above number then can further be associated to a deal or a facility.

## Test 🧑‍💻

To test above function, ensure `number-generator` docker container is up and running.
Once fully initialised, please pass the following `cURL` command.

```bash
  curl "http://localhost:7072/api/orchestrators/numbergenerator" -d '{ "entityType":"deal", "entityId":"12345" }'
```

# Standardising Docstrings using JSDoc and TSDoc

## Overview

This document outlines the guidelines for standardising the docstrings across our codebase using **JSDoc** for JavaScript files and **TSDoc** for TypeScript files. The aim is to ensure consistency, clarity, and comprehensive documentation of all functions, classes, types, and interfaces in the codebase. This will be addressed in an upcoming tech-debt ticket.

## Why standardise Docstrings?

1. **Consistency**: standardised docstrings ensure that all parts of the codebase are documented in a uniform way, making it easier for developers to read and understand.

2. **Clarity**: Clear and consistent documentation helps in understanding the purpose, usage, and behavior of different parts of the code.

3. **Maintainability**: Well-documented code is easier to maintain and modify as it provides a clear understanding of what each part of the code does.

4. **Tooling Support**: Visual studio code provide enhanced support for JSDoc and TSDoc, including intellisense, type checking, and automated documentation generation.

## Docstring Standards

### 1. General Format

- **Description**: Every function, class, type, and interface should have a clear and concise description explaining what it does.
- **Tags**: Utilise appropriate tags to describe parameters, return types, exceptions, etc.
- **Types**: Specify the types of parameters and return values for clarity, especially in TypeScript.

### 2. JSDoc for JavaScript

JSDoc is a popular standard for documenting JavaScript code. We will use JSDoc for all JavaScript files.

#### Example JSDoc Template

```javascript
/**
 * Description of the function.
 *
 * @param {Type} paramName - Description of the parameter.
 * @param {Type} [optionalParamName] - Description of the optional parameter.
 * @param {Type} [optionalParamName=1] - Description of the optional parameter with a default value
 * @returns {Type} Description of the return value.
 * @throws {ErrorType} Description of the error.
 */
function exampleFunction(paramName, optionalParamName) {
  // function implementation
}
```

#### Example JSDoc for a Class

```javascript
/**
 * Represents a simple example class.
 */
class ExampleClass {
  /**
   * Creates an instance of ExampleClass.
   * @param {number} id - The ID of the instance.
   * @param {string} name - The name of the instance.
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  /**
   * Gets the name of the instance.
   * @returns {string} The name of the instance.
   */
  getName() {
    return this.name;
  }
}
```

### 3. TSDoc for TypeScript

TSDoc is an extension of JSDoc that provides more detailed documentation features for TypeScript. We will use TSDoc for all TypeScript files.

#### Example TSDoc Template

```typescript
/**
 * Description of the function.
 *
 * @param paramName - Description of the parameter.
 * @param [optionalParamName] - Description of the optional parameter.
 * @returns Description of the return value.
 * @throws Description of the error.
 */
function exampleFunction(paramName: string, optionalParamName?: number): boolean {
  // function implementation
}
```

```typescript
/**
 * Description of a async function.
 *
 * @param paramName - Description of the parameter.
 * @param [optionalParamName] - Description of the optional parameter.
 * @returns Description of the return value as a promise.
 * @throws Description of the error.
 */
const exampleFunction = async (paramName: string, optionalParamName?: number): Promise<boolean> => {
  // function implementation
};
```

#### Example TSDoc for a Class

```typescript
/**
 * Represents a simple example class.
 */
class ExampleClass {
  private id: number;
  private name: string;

  /**
   * Creates an instance of ExampleClass.
   * @param id - The ID of the instance.
   * @param name - The name of the instance.
   */
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  /**
   * Gets the name of the instance.
   * @returns The name of the instance.
   */
  getName(): string {
    return this.name;
  }
}
```

### 4. Interfaces and Types

For interfaces and types, use JSDoc or TSDoc to describe the purpose and each property.

#### Example TSDoc for an Interface

```typescript
/**
 * Represents a user in the system.
 */
interface User {
  /**
   * The unique identifier of the user.
   */
  id: number;

  /**
   * The username of the user.
   */
  username: string;

  /**
   * The email address of the user.
   */
  email: string;
}
```

#### References

- [JSDocs](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [TSDocs](https://tsdoc.org/)

## Steps for Implementation

1. **Audit**: Review the existing codebase to identify functions, classes, types, and interfaces lacking proper documentation.

2. **standardise**: Rewrite the docstrings using the appropriate JSDoc or TSDoc format as outlined above.

3. **Review**: Ensure that all docstrings are consistent and adhere to the standards set in this document.

4. **Automate**: Set up linters or pre-commit hooks to enforce docstring standards on future code submissions.

5. **Document**: Update the team on the new standards and provide examples and resources for writing compliant docstrings.

## Future work

Standardisation of the existing code base should be performed under `DTFS2-7329` ticket, using branch `docs/DTFS2-7329-code-base-documentation-standardisation`.

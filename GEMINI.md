# GEMINI.md

## Project Overview

This project, named FLARE, is a Node.js application that provides a powerful framework for recursive AI prompting. It allows users to query multiple AI models simultaneously, control response variability, and apply advanced post-processing functions like summarizing, combining, or contrasting responses. FLARE exposes a RESTful API for processing its custom language and is designed with a modular, "Atomic File Structure" for maintainability and scalability.

The main technologies used are:
*   **Backend:** Node.js with Express.js
*   **Testing:** Mocha, Chai, Sinon
*   **Linting/Formatting:** (Not explicitly defined, but can be inferred from conventions)

The project is structured into three main directories:
*   `src/parser`: Handles parsing of the FLARE command syntax.
*   `src/server`: Sets up the Express.js server, middleware, and routes.
*   `src/services`: Contains the core business logic for processing FLARE commands, including querying AI models and applying post-processing.

## Building and Running

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will run on `http://localhost:8080` by default.

### Running Tests

The project has a comprehensive test suite.

*   **Run all tests:**
    ```bash
    npm test
    ```

*   **Run unit tests:**
    ```bash
    npm run test:unit
    ```

*   **Run end-to-end tests:**
    ```bash
    npm run test:e2e
    ```

*   **Run integration tests:**
    ```bash
    npm run test:integration
    ```

## Development Conventions

*   **Atomic File Structure:** Each file contains exactly one function, promoting modularity and testability.
*   **Clear Naming:** File names match the function they contain for easy navigation.
*   **Comprehensive Testing:** The project has a high test coverage, with unit, integration, and end-to-end tests.
*   **Environment Variables:** API keys and other configurations are managed through a `.env` file. An `.env.example` file is provided as a template.

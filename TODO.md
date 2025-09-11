# FLARE Backend Implementation TODO List

This document outlines the tasks required to fully implement the FLARE backend system according to the project's README and the Pollinations API documentation.

---

### General
- [ ] **Configuration:** Create a central configuration file (e.g., `config.js`) to manage settings like the Pollinations API base URL, default model, server port, and any API tokens, instead of hardcoding them.
- [ ] **Error Handling:** Implement more robust and consistent error handling across all services. Errors from the Pollinations API should be gracefully caught and propagated back to the user with meaningful messages.
- [ ] **Logging:** Enhance logging to provide more insight into the request lifecycle, including the parsed FLARE command, which models are being queried, and the results of post-processing.

---

### `modelService.js`
- [ ] **Switch to POST Endpoint:** Refactor `executeModelQuery` to use the `POST https://text.pollinations.ai/openai` endpoint. This is more robust, aligns with the OpenAI-compatible standard, and handles parameters like temperature more explicitly.
- [ ] **Pass All Parameters:** Ensure all relevant parameters from the parsed FLARE command (especially `temp`) are correctly passed to the Pollinations API in the `executeModelQuery` function.
- [ ] **Standardize Response Parsing:** By using the `POST` endpoint, the response structure will be predictable (OpenAI chat completion format). Update the response parsing logic to reliably extract the content from `response.data.choices[0].message.content`.
- [ ] **Authentication:** Implement a strategy to use an API token for the Pollinations API. This should be read from the new config file and included as a Bearer token in the `Authorization` header of the request.

---

### `postProcessingService.js`
- [ ] **Improve Summarization (`sum`):** The current implementation is too basic. Re-implement the `summarizationPostProcessing` function to make a new call to the language model.
    - **Action:** Combine the responses from the initial queries into a single text block.
    - **Action:** Create a new prompt like: "Please summarize the following texts into a single, coherent response: [combined text]".
    - **Action:** Send this new prompt to the `modelService` to get a high-quality summary.
- [ ] **Improve Voting (`vote`):** The current word-frequency voting is not effective for complex responses.
    - **Action:** Re-implement the `votingPostProcessing` function.
    - **Action:** Combine the responses.
    - **Action:** Formulate a new prompt asking a model to choose the best response, e.g., "From the following responses, which one best answers the original question? Please return only that response, without any extra commentary. Responses: [combined text]".
    - **Action:** Send this to the `modelService`.
- [ ] **Implement Other Post-Processing:** Add implementations for the other planned post-processing commands mentioned in `flareParser.js`:
    - [ ] `comb`: Combine responses into a single text.
    - [ ] `diff`: Find the differences between responses.
    - [ ] `exp`: Explain the responses.
    - [ ] `filter`: Filter the responses based on some criteria.

---

### `test/testFlareBackend.js`
- [ ] **Fix Port Number:** Update the port in the test script from `3000` to `8080` to match the server configuration.
- [ ] **Add Assertions:** The script currently only prints responses. Add actual tests using an assertion library like `chai` or Node's built-in `assert` module to verify that the responses are not null, are strings, and (eventually) match expected outputs for canned queries.
- [ ] **Expand Test Cases:** Add more test cases to cover:
    - Queries with multiple models.
    - All implemented post-processing commands (`sum`, `vote`, etc.).
    - Invalid FLARE command syntax to ensure errors are handled correctly.

---

### `server.js`
- [ ] **Integrate Configuration:** Refactor the server to use the proposed `config.js` file for the port number.
- [ ] **CORS Configuration:** The current CORS setup is wide open (`*`). For a production environment, this should be tightened to only allow requests from specific, trusted origins.

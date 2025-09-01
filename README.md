# FLARE: Fractal Language for Autonomous Recursive Expansion

The FLARE language provides a powerful framework for recursive AI prompting. The ability to specify models, control response variability, and apply advanced post-processing functions enables developers to extract the most value from their AI tools. By leveraging multiple models, they can ensure diverse and accurate responses, similar to the "wisdom of the (llm) crowd" while post-processing functions like summarizing, combining, or contrasting these responses allow for nuanced and comprehensive outputs. This flexibility makes FLARE a versatile and valuable language for AI tool development.

## Quick Start

### 1. Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd FLARE

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your Pollinations.ai API key
```

### 2. Running the Application
```bash
# Start the backend server
npm start

# The LLM comparison tool will be available at:
# http://localhost:8080
```

### 3. Required Environment Variables
Create a `.env` file with:
```
POLLINATIONS_API_KEY=your_api_key_here
PORT=8080
POLLINATIONS_API_URL=https://text.pollinations.ai/openai
DEFAULT_MODEL=openai
```

⚠️ **Security Note**: Never commit your `.env` file or API keys to version control!

#### Syntax Integration
- Use curly braces `{}` to enclose prompts.
- Each prompt will include properties such as model type, size, temperature, etc., in the format `{ flare model:model_name temp:temperature `prompt text`}`.
- For multiple model queries with post-processing, we can use additional parameters like `sum`, `comb`, `vote`, `diff`, `exp`, `filter`.

#### Command Structure
- `model`: Specifies the exact model name(s) (e.g., `llama3-13b`, `gemma-2b`).
- `temp`: Specifies the temperature setting for response variability.
- `sum`: Summarizes and consolidates multiple responses.
- `comb`: Combines the responses from multiple models without summarizing, useful for maintaining diverse viewpoints.
- `vote`: Votes for the most common or highest confidence response.
- `diff`: Highlights differences between responses from different models, useful for comparative analysis.
- `exp`: Expands on the initial response with additional details from another model.
- `filter`: Filters responses based on certain criteria such as relevance or length.

### Example Case with FLARE

**User Prompt:**
"Discuss the benefits of renewable energy sources and their impact on the environment."

**AI Response:**
"Renewable energy sources, such as solar and wind power, offer numerous benefits including reduced greenhouse gas emissions. { flare model:llama3-13b `List the benefits of solar energy.` } Additionally, renewable energy can reduce dependence on fossil fuels. { flare model:llama3-7b, mixtral-3b temp:0.8 vote `Explain how wind energy impacts the environment.` } These sources are also more sustainable in the long run. { flare model:llama3-7b, gemma-2b temp:0.4 sum:eurux-22b `Discuss the sustainability of hydroelectric power.` }"

### Explanation of Commands

1. **Model Specification**:
   - `model`: Defines which LLM to use for generating the response. Multiple models can be listed, separated by commas, to leverage diverse insights.

2. **Temperature Control**:
   - `temp`: Sets the temperature parameter to control the variability of responses. Lower values make the output more deterministic, while higher values introduce more creativity.

3. **Post Commands**:
   - `sum`: When multiple models are specified, this parameter can be used to designate a summarizing model to combine their outputs into a single coherent response. is no model is passed, it will use the default specified model
   - `vote`: This parameter can be used to rank for the best output
   

### Resolving Each FLARE Prompt

1. **Solar Energy Benefits Prompt:** were generated solely by the `llama3-13b` model.
   - **FLARE Prompt:** `{ flare model:llama3-13b `List the benefits of solar energy.` }`
   - **Resolved Output:** The `llama3-13b` model generates a response: "Solar energy is abundant, reduces electricity bills, has low maintenance costs, helps in reducing carbon footprints, and is a renewable resource."

2. **Wind Energy Impact Prompt:** was determined by voting between the responses of `llama3-7b` and `mixtral-3b`, with the winning response being the reduction in air pollution and water usage.
   - **FLARE Prompt:** `{ flare model:llama3-7b, mixtral-3b temp:0.8 vote `Explain how wind energy impacts the environment.` }`
   - **Process:**
     - `llama3-7b` generates: "Wind energy reduces air pollution and water usage."
     - `mixtral-3b` generates: "Wind energy can affect wildlife habitats and migratory patterns."
     - Using the `vote` parameter, the most common or highest confidence response is selected.
   - **Resolved Output:** The response selected is: "Wind energy reduces air pollution and water usage."

3. **Sustainability of Hydroelectric Power Prompt:** was summarized by `eurux-22b` from the responses of `llama3-7b` and `gemma-2b`.
   - **FLARE Prompt:** `{ flare model:llama3-7b, gemma-2b temp:0.4 sum:eurux-22b `Discuss the sustainability of hydroelectric power.` }`
   - **Process:**
     - `llama3-7b` generates: "Hydroelectric power is highly sustainable but can impact local ecosystems."
     - `gemma-2b` generates: "Hydroelectric power can affect water quality but provides a renewable energy source."
     - Using the `sum` parameter, `eurux-22b` summarizes these responses.
   - **Resolved Output:** "Hydroelectric power is highly sustainable but can impact local ecosystems and water quality, while providing a renewable energy source."

### Final Output:

Combining the resolved outputs from each FLARE prompt into the original text results in the final expanded response. This process ensures diverse insights from multiple models while summarizing and refining the information to provide a coherent and comprehensive answer.

**Final Output:**
"Renewable energy sources, such as solar and wind power, offer numerous benefits including reduced greenhouse gas emissions. Solar energy is abundant, reduces electricity bills, has low maintenance costs, helps in reducing carbon footprints, and is a renewable resource. Additionally, renewable energy can reduce dependence on fossil fuels. Wind energy reduces air pollution and water usage. These sources are also more sustainable in the long run. Hydroelectric power is highly sustainable but can impact local ecosystems and water quality, while providing a renewable energy source."




Write an answer, using FLARE queries inside the text to hint for further expansion, explaining the benefits of using solar energy to power autonomous vehicles and infrastructure in rural settings. be very technical and cite research to justify your points. 
Don't use flare queries only in the end of paragraphs.



const { OpenAI } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Calls the OpenAI ChatGPT API with the given prompt and model.
 * @param {object} params
 * @param {string} [params.prompt] - The prompt to send to ChatGPT (preferred).
 * @param {string} [params.input] - The input to send to ChatGPT (used if prompt is not provided).
 * @param {string} params.model - The model to use (e.g., 'gpt-3.5-turbo').
 * @param {object} [params.options] - Additional options (e.g., temperature, max_tokens).
 * @returns {Promise<string>} - The response content from ChatGPT.
 */
async function promptChatGpt({ prompt, input, model, options = {} }) {
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set in environment');
    if (!prompt && !input) throw new Error('Either prompt or input must be provided');

    const message = prompt ? { model, prompt, ...options } : { model, input, ...options };

    try {
        const response = await client.responses.create(message);
        return response.output_text;
    } catch (err) {
        console.error('Error calling OpenAI API:', err.response?.data || err.message);
        throw err;
    }
}

module.exports = { promptChatGpt };

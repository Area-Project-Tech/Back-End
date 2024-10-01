const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const generateText = async (parameters, context) => {
  const { prompt, maxTokens = 100 } = parameters;

  const response = await openai.complete({
    engine: 'davinci',
    prompt: prompt,
    maxTokens: maxTokens,
    temperature: 0.5,
  });

  return response.data.choices[0].text.trim();
};

module.exports = {
  generateText: {
    handler: generateText,
    schema: {
      prompt: { type: 'string', required: true },
      maxTokens: { type: 'number', required: false, default: 100 },
    },
  },
};
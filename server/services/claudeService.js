const OpenAI = require('openai')
const { OPENAI_API_KEY } = require('../config/env')
const { UpstreamError, ValidationError } = require('../middleware/errorHandler')

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

/**
 * @param {{ systemPrompt: string, userMessage: string, maxTokens: number, temperature?: number }} params
 * @returns {Promise<string>} Raw text content from OpenAI
 */
async function callClaude({ systemPrompt, userMessage, maxTokens, temperature = 0.2 }) {
  const start = Date.now()
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })

    const elapsed = Date.now() - start
    const usage = response.usage
    console.info(`[OpenAI] gpt-4o — prompt: ${usage.prompt_tokens} tokens, completion: ${usage.completion_tokens} tokens, total: ${usage.total_tokens} tokens, time: ${elapsed}ms`)

    return response.choices[0].message.content
  } catch (err) {
    const elapsed = Date.now() - start
    console.error(`[OpenAI] Error after ${elapsed}ms:`, err.message)

    if (err.status === 429) {
      await new Promise(r => setTimeout(r, 2000))
      try {
        const retry = await openai.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: maxTokens,
          temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        })
        return retry.choices[0].message.content
      } catch {
        throw new UpstreamError('AI service is rate-limited. Please try again in a moment.')
      }
    }

    if (err.status === 400) {
      throw new ValidationError('AI request was invalid. Please try a different query.')
    }

    if (err.status === 401) {
      console.error('[OpenAI] FATAL: Invalid API key')
      throw new UpstreamError('AI service authentication failed.', false)
    }

    throw new UpstreamError('AI service is temporarily unavailable. Please retry.', true)
  }
}

/**
 * @param {string} text
 * @returns {any} Parsed JSON
 */
function parseJSON(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(cleaned)
}

module.exports = { callClaude, parseJSON }

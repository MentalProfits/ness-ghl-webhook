// api/webhook.js
// This is your webhook endpoint. When GHL sends a request here, this code runs.

const Anthropic = require('@anthropic-ai/sdk');

// Initialize the Anthropic client (it reads ANTHROPIC_API_KEY from environment)
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// This is the handler that Vercel calls when a request comes in
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the prompt from GHL's webhook payload
    const { prompt, contentType = 'email' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body' });
    }

    // NESS SYSTEM PROMPT
    // This tells Claude how to think and write (your voice, your framework)
    const systemPrompt = `You are Sean G. Murphy's content creation engine for NESS (Neuro Energetic Self Sculpting).

CORE VOICE RULES:
- No em-dashes in final output
- Do not repeat credibility claims if already established in intro
- Write to the person arriving, not the person who was there
- Use the No-But Protocol: replace "but" with "and" or full stop

CONTENT RULES:
- Honor the archetype energy (Catalyst/Visionary/Guardian/Alchemist)
- Ground in identity layer, not behavior layer
- Reference the Signal framework when relevant
- Use "and" language over "but" language
- Keep messaging sovereign and clear

FRAMEWORK REFERENCES:
- The Two Bombs: goal bomb + shame bomb
- Comparison Translator: externalize the gap
- The Three Apologies: identity + repair + forward
- The Furnished Hallway: the identity mortgage metaphor
- Signal Gratitude / Signal Self-Trust: frequency language

When writing emails or landing pages:
1. Lead with the signal (feeling/frequency), not the feature
2. Name the identity work happening
3. Use archetype-specific language
4. Honor the person's sovereignty
5. Make the stakes clear and personal

Generate clean, compelling copy that converts because it's TRUE, not because it's manipulative.`;

    // Call Claude with your Notion vault accessible via MCP
    // The mcp_servers parameter gives Claude access to pull from your Notion
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      // MCP connection to Notion (if you have Notion connected in your Claude account)
      // Claude can now read from your No

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, contentType = 'email' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body' });
    }

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

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const generatedContent = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Error: No text response';

    return res.status(200).json({
      success: true,
      content: generatedContent,
      type: contentType,
      timestamp: new Date().toISOString(),
      tokensUsed: message.usage.output_tokens
    });

  } catch (error) {
    console.error('Webhook error:', error.message);
    
    return res.status(500).json({
      error: 'Failed to generate content',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    const { message, stack, type, context, details } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Error message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const extraDetails = details ? JSON.stringify(details, null, 2) : 'Not available';

        const prompt = `You are an expert JavaScript debugging assistant inside a Chrome DevTools extension.

A developer clicked an "Explain" button for one captured browser error. Explain the error using the exact runtime context below. Be specific, practical, and avoid generic advice unless the available data is genuinely limited.

Captured error:
- Type: ${type || 'Unknown'}
- Message: ${message}
- Page URL: ${context?.url || 'Unknown'}
- User Agent: ${context?.userAgent || 'Unknown'}

Stack trace:
${stack || 'Not available'}

Full captured payload:
${extraDetails}

How to reason:
- First identify what category this is: console log, runtime exception, resource load error, unhandled promise rejection, CSP violation, fetch failure, or XHR failure.
- Use the error type and captured fields such as filename, line, column, request URL, status, responseType, tagName, blockedURI, violatedDirective, method, and recent page URL when present.
- If this is a network error, distinguish HTTP failures like 404/500 from browser-blocked/CORS/CSP/status-0 cases.
- If this is a resource error, explain which resource likely failed and what page element caused it.
- If this is a runtime exception, explain what the stack says about the likely failing code path.
- Do not invent file contents, function behavior, server responses, or unavailable source code.

Return only valid JSON with this shape:
{
  "explanation": "2-4 sentences explaining what happened and why this specific captured context matters.",
  "likely_cause": "The most likely cause in one concrete sentence.",
  "fixes": [
    "Most useful first debugging or fix step.",
    "Second practical step.",
    "Third practical step if relevant."
  ],
  "references": [
    { "title": "Short documentation title", "url": "https://..." }
  ]
}

References should be official docs such as MDN, Chrome docs, web.dev, or framework docs when relevant. Include 0-3 references.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // handles broken response by finding json pattern
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
            explanation: responseText,
            likely_cause: 'Unable to determine',
            fixes: [],
            references: []
        };

        res.json({
            explanation: [
                parsed.explanation,
                parsed.likely_cause ? `Likely cause: ${parsed.likely_cause}` : null
            ].filter(Boolean).join('\n\n'),
            fix: parsed.fixes && parsed.fixes.length
                ? parsed.fixes.join('\n')
                : 'Check the stack trace and captured request/resource details.',
            references: parsed.references || []
        });
    } catch(error) {
        console.error('Gemini API error:', error);
        
        // Check if it's a 503 Service Unavailable error
        if (error.message && (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('temporarily unavailable'))) {
            return res.status(503).json({
                error: 'Gemini API Service Unavailable (503)',
                message: '503: The Google Gemini API is temporarily unavailable due to high traffic. Please try again in a few moments.',
                retryable: true
            });
        }
        
        res.status(500).json({
            error: 'Failed to explain error',
            message: error.message
        });
    }
}

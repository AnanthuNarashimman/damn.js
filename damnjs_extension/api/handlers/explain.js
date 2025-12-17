const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    const { message, stack, type, context } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Error message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        const prompt = `You are an expert JavaScript debugger. A developer encountered this error:
                        **Error Type:** ${type}
                        **Error Message:** ${message}
                        **Stack Trace:**
                        ${stack || 'Not available'}

                        **Context:**
                        - URL: ${context?.url || 'Unknown'}
                        - User Agent: ${context?.userAgent || 'Unknown'}

                        Provide:
                        1. A clear, concise explanation of what this error means (2-3 sentences)
                        2. The most likely cause
                        3. 2-3 practical fixes or debugging steps
                        4. Any relevant documentation links or MDN references

                        Format your response as JSON with keys: explanation, likely_cause, fixes (array), references (array of {title, url})`;

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
            explanation: parsed.explanation,
            fix: (parsed.fixes && parsed.fixes[0]) || 'Check the stack trace and logs',
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
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    const { message, stack, type, context, recentErrors } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Error message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        const recentContext = recentErrors && recentErrors.length
            ? `\n\nRecent errors in same session:\n${recentErrors.map(e => `- ${e.message}`).join('\n')}`
            : '';

        const prompt = `You are an expert at creating focused, high-quality debugging prompts for AI code assistants.
                        Your job is to generate a structured prompt that includes all necessary context so an AI assistant can effectively help fix a bug.
                        The prompt should be:
                        - Specific and actionable
                        - Include relevant error details, stack trace, and context
                        - Ask for clear debugging steps, not just explanation
                        - Request reproducible steps if applicable
                        - Ask for any necessary fixes and verification steps
                        - Be copy-paste ready for pasting into an AI assistant

                        Generate a debugging prompt for this error. The prompt will be pasted into an AI code assistant to help fix it:

                        **Error Type:** ${type}
                        **Error Message:** ${message}
                        **Stack Trace:**
                        ${stack || 'Not available'}

                        **Context:**
                        - URL: ${context?.url || 'Unknown'}
                        - User Agent: ${context?.userAgent || 'Unknown'}${recentContext}

                        Create a well-structured prompt (2-4 paragraphs) that an AI assistant can use to help debug and fix this issue. Include a request for:
                        1. Root cause analysis
                        2. Step-by-step fix
                        3. Code example if applicable
                        4. Verification steps`;

        const result = await model.generateContent(prompt);
        const generatedPrompt = result.response.text();

        res.json({
            prompt: generatedPrompt,
            note: 'Copy this prompt and paste it into your AI assistant (Claude, Cursor, ChatGPT, etc.)'
        });
    } catch (error) {
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
            error: 'Failed to generate prompt',
            message: error.message
        });
    }
};
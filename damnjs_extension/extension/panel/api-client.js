// Middleman program connecting the extension and the backend

// Object literal that holds necessary functions
const ApiClient = {
    // backend url
    baseUrl: 'http://localhost:3000',

    // function to get error explanations from backend
    async explain(error) {
        const response = await fetch(`${this.baseUrl}/api/explain`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                type: error.type,
                context: error.context
            })
        });

        if(!response.ok) throw new Error('API error: '+ response.statusText);
        return response.json();
    },

    // function to get prompts for errors from backend
    async generatePrompt(error) {
        const response = await fetch(`${this.baseUrl}/api/generate-prompt`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                type: error.type,
                context: error.context,
                recentErrors: errors.slice(0,5)
            })
        });

        if(!response.ok) throw new Error('API error: '+ response.statusText);
        return response.json();
    }
};
// Middleman program connecting the extension and the backend

// Object literal that holds necessary functions
const ApiClient = {
    // vercel url
    baseUrl: 'https://damn-7q8j3fc9f-ananthunarashimmans-projects.vercel.app',

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
    async generatePrompt(error, allErrors = []) {
        const response = await fetch(`${this.baseUrl}/api/generate-prompt`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                type: error.type,
                context: error.context,
                recentErrors: allErrors.slice(0,5)
            })
        });

        if(!response.ok) throw new Error('API error: '+ response.statusText);
        return response.json();
    }
};
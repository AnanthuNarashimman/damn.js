const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const explainHandler = require('./handlers/explain');
const generatePromptHandler = require('./handlers/generatePrompt');

app.get('/', (req, res) => {
    res.json({ status: 'damn.js API is running...'});
})


app.post('/api/explain', explainHandler);
app.post('/api/generate-prompt', generatePromptHandler);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;

if(require.main == module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`damn.js API is running on http://localhost:${PORT}`)
    })
}
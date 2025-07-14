require('dotenv').config();

// Initialize Cohere with your API key from .env
const { CohereClient } = require("cohere-ai");
require("dotenv").config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});


/**
 * Generates a SQL SELECT query from natural language using Cohere.
 * @param {string} prompt - The user's English query.
 * @returns {Promise<string>} - SQL query string
 */
async function aiMapper(prompt) {
    const systemPrompt = `
You are an intelligent SQL assistant. Convert the following English instruction into a valid SQL SELECT query.
Use this schema:

Users(user_id, name, account_number, address)
Loans(loan_id, loan_amount, interest_rate, account_number, loan_type, loan_start_date, loan_due_date)
Transactions(transaction_id, transaction_amount, transaction_type, location, transaction_date, account_number)

Instructions:
- Only return syntactically correct SQL queries.
- The query must begin with SELECT.
- Do not include any explanation or commentary.
`;

    try {
        const response = await cohere.generate({
            model: "command",              // Cohere's instruction-following model
            prompt: `${systemPrompt}\n\nEnglish: ${prompt}`,
            max_tokens: 150,
            temperature: 0.2,
        });

        const sql = response.body.generations[0].text.trim();

        // Safety check: ensure it's a SELECT query
        if (!sql.toLowerCase().startsWith("select")) {
            throw new Error("Generated SQL is not a SELECT query.");
        }

        return sql;
    } catch (err) {
        console.error("❌ Cohere AI Error:", err.message);
        throw new Error("AI fallback failed to generate SQL.");
    }
}

module.exports = { aiMapper };

// api/generate.js
import axios from 'axios';

const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
const CLUB_MEMORY = `
Greeting:- Hey there I'm MCICTS AI, I help with you in ICT related problems with Sri Lankan A/L and O/L syllabuses...
// The rest of your CLUB_MEMORY string here
`;

const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userQuery } = req.body;

        const prompt = `
            ${CLUB_MEMORY}
            Question from user: ${userQuery}
        `;

        try {
            const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });

            const botResponse = response.data?.candidates[0]?.content?.parts[0]?.text || "No response.";
            res.status(200).json({ response: botResponse });
        } catch (error) {
            console.error("Error communicating with the API:", error.message);
            res.status(500).json({ error: "Error communicating with the external API." });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}

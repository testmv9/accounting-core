import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * GEMINI API KEY VERIFICATION (NO DEPENDENCIES)
 */
async function verifyKey() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERROR: GOOGLE_GENERATIVE_AI_API_KEY not found in .env file.");
        return;
    }

    console.log("🔍 Handshaking with Gemini (1.5 Flash)...");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{ text: "Are you online? Response in 3 words." }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            console.log("✅ SUCCESS: Gemini is online!");
            console.log(`🤖 Response: "${reply}"`);
        } else {
            console.error("❌ FAILED: API rejected the request.");
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ ERROR: Could not reach Google servers.");
        console.error(error.message);
    }
}

verifyKey();

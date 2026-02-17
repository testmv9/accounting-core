import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * GEMINI API KEY VERIFICATION (SELF-LOGGING)
 */
async function verifyKey() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    let log = "VERIFICATION LOG\n==============\n";

    if (!apiKey) {
        log += "❌ ERROR: GOOGLE_GENERATIVE_AI_API_KEY not found in .env\n";
        fs.writeFileSync('verify_result.txt', log);
        return;
    }

    log += "🔍 Handshaking with Gemini...\n";

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
            log += `✅ SUCCESS: Gemini is online!\n🤖 Response: "${reply}"\n`;
        } else {
            log += `❌ FAILED: API rejected request.\n${JSON.stringify(data, null, 2)}\n`;
        }
    } catch (error) {
        log += `❌ ERROR: ${error.message}\n`;
    }

    fs.writeFileSync('verify_result.txt', log);
    console.log("Log written to verify_result.txt");
}

verifyKey();

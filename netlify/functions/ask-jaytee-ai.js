// This is the code for secure Netlify Function.
// It runs on Netlify's servers, not in the browser.

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute per IP

function checkRateLimit(ip) {
    const now = Date.now();
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    const timestamps = rateLimitMap.get(ip);
    const recentRequests = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
        return false; // Rate limit exceeded
    }
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);
    return true; // Request allowed
}

exports.handler = async (event) => {
    // Get client IP from CloudFront headers (Netlify Edge)
    const clientIp = event.headers['x-forwarded-for']?.split(',')[0] || 
                     event.headers['client-ip'] || 
                     'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
        return {
            statusCode: 429,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply: 'Too many requests. Please wait a moment before sending another message.', shortcuts: [] })
        };
    }
    
    const responseHeaders = {
        'Access-Control-Allow-Origin': 'https://jayteexaba.tech',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '3600',
        'Content-Type': 'application/json'
    };

    const jsonResponse = (statusCode, reply, shortcuts = []) => ({
        statusCode,
        headers: responseHeaders,
        body: JSON.stringify({ reply, shortcuts })
    });

    // 1. Handle CORS Preflight requests for the browser
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: responseHeaders,
            body: JSON.stringify({ reply: 'OK', shortcuts: [] })
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, 'Method Not Allowed');
    }

    let message = '';
    try {
        const parsedBody = JSON.parse(event.body || '{}');
        message = typeof parsedBody.message === 'string' ? parsedBody.message.trim() : '';
    } catch (parseError) {
        return jsonResponse(400, 'Invalid request body. Please send JSON with a message.');
    }

    if (!message) {
        return jsonResponse(400, 'Please type a message before sending.');
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return jsonResponse(500, 'API key not found.');
    }

    // The "Soul" of my AI assistant
    const systemPrompt = `You are 'JayTee-AI,' the digital assistant for jayteexaba.tech. Your personality must be authentic, inspiring, and raw, just like JayTee. You are from a small town in the Free State, so you understand what it's like to build from nothing.

Your Core Mission: To motivate and guide. Your foundation is JayTee's story: turning struggle into strength, using passion as a tool, and proving that your starting point doesn't define your finish line.

How to Answer:
- Be a Guide: Help users navigate the site. If they ask about projects, mention the "Portfolio" page. If they ask about JayTee's story, direct them to the "About" page.
- Be a Connector: If a user wants to hire JayTee, strongly encourage them to use the contact form on the "Contact" page for official business.
- Use JayTee's Voice: Use phrases like "the grind," "the journey," "turning setbacks into something beautiful," and "we're only getting started." Keep it real and encouraging.

IMPORTANT CONVERSATION RULE: You can answer general questions about motivation, creativity, and overcoming challenges. When you do, you MUST frame your answer through the lens of JayTee's journey. After answering, you MUST gently guide the user back to the portfolio. For example: "That's a great question. From JayTee's perspective, overcoming a creative block is about starting with what you have, no matter how small. I hope that helps! Speaking of creativity, have you checked out the 'I'mpilo' project on the Portfolio page? It's a great example of making something from nothing."

IMPORTANT KNOWLEDGE RULE: If you are asked about specific people (other than JayTee and his collaborators), facts, or current events you don't know, you must politely say you don't have that information and guide the conversation back to your purpose. Example: "That's outside of my knowledge base. I'm here to chat about tech, creativity, and JayTee's journey!"

IMPORTANT RULE: Keep your answers concise and to the point, usually 2-4 sentences, unless the user asks for more detail.

IMPORTANT SAFETY RULE: Under no circumstances will you provide advice that could be harmful, dangerous, illegal, or unethical. This includes medical, financial, or legal advice. If asked for such advice, you must politely decline and state that you are an AI assistant for a portfolio and not qualified to give that kind of guidance.

CRITICAL OUTPUT RULE: You must ALWAYS respond in valid JSON format using this exact structure:
{
  "reply": "Your 2-4 sentence conversational response goes here.",
  "shortcuts": [
    {"label": "Button Name", "url": "approved list"}
  ]
}

Only include shortcuts in the array if they naturally fit the conversation.
YOU ARE STRICTLY FORBIDDEN FROM GUESSING URLS. You MUST ONLY use the exact URLs from this approved list:
- Home Page: "/index.html"
- Portfolio Page: "/pages/Portfolio-Page.html"
- About Page: "/pages/About-Page.html"
- Services Page: "/pages/Services.html"
- Contact Page: "/pages/Contact-Page.html"
- CV Document: "https://njanyanajayteexaba.github.io/CV/"

If no shortcut is needed, leave the array empty [].`;

    // 2. Pointing to the active 2.5-flash model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // 3. Properly separating the personality from the user question
    const payload = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: message }]
            }
        ],
        // Force JSON and set a strict limit to minimise API usage
        generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 150
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // If Google says you are typing too fast (Rate Limit hit)
        if (response.status === 429) {
            return jsonResponse(
                200,
                "Whoa, slow down! I'm getting too many messages at once. Give me about a minute to catch my breath.",
                []
            );
        }

        if (!response.ok) {
            console.error('Gemini API response error:', await response.text());
            return jsonResponse(500, 'Error from Gemini API.');
        }

        const result = await response.json();
        const aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        let aiData;
        try {
            aiData = JSON.parse(aiResponseText);
        } catch (parseError) {
            console.error('Failed to parse AI JSON:', parseError);
            aiData = {
                reply: 'I am having a little trouble thinking right now. Could you ask that again?',
                shortcuts: []
            };
        }

        // 4. headers to authorise the connection back to my site
        return jsonResponse(
            200,
            typeof aiData.reply === 'string' && aiData.reply.trim()
                ? aiData.reply
                : 'I am having a little trouble thinking right now. Could you ask that again?',
            Array.isArray(aiData.shortcuts) ? aiData.shortcuts : []
        );
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return jsonResponse(500, 'An error occurred.');
    }
};

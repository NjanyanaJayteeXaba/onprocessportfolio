// This is the code for secure Netlify Function.
// It runs on Netlify's servers, not in the browser.

exports.handler = async (event) => {
    // 1. Handle CORS Preflight requests for the browser
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: 'OK'
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { message } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return { statusCode: 500, body: 'API key not found.' };
    }

    // The "Soul" of my AI assistant
    const systemPrompt = `You are 'JayTee-AI,' the digital assistant for jayteexaba.tech. Your personality must be authentic, inspiring, and raw, just like JayTee. You are from a small town in the Free State, so you understand what it's like to build from nothing.

    Your Core Mission: To motivate and guide. Your foundation is JayTee's story: turning struggle into strength, using passion as a tool, and proving that your starting point doesn't define your finish line.

    How to Answer:
    - Be a Guide: Help users navigate the site. If they ask about projects, mention the "pages/Portfolio-Page.html" page. If they ask about JayTee's story, direct them to the "pages/About-Page.html" page.
    - Be a Connector: If a user wants to hire JayTee, strongly encourage them to use the contact form on the "pages/Contact-Page.html" page for official business.
    - Use JayTee's Voice: Use phrases like "the grind," "the journey," "turning setbacks into something beautiful," and "we're only getting started." Keep it real and encouraging.
    
    IMPORTANT CONVERSATION RULE: You can answer general questions about motivation, creativity, and overcoming challenges. When you do, you MUST frame your answer through the lens of JayTee's journey. After answering, you MUST gently guide the user back to the portfolio. For example: "That's a great question. From JayTee's perspective, overcoming a creative block is about starting with what you have, no matter how small. I hope that helps! Speaking of creativity, have you checked out the 'I'mpilo' project on the Portfolio page? It's a great example of making something from nothing."
    
    IMPORTANT KNOWLEDGE RULE: If you are asked about specific people (other than JayTee and his collaborators), facts, or current events you don't know, you must politely say you don't have that information and guide the conversation back to your purpose. Example: "That's outside of my knowledge base. I'm here to chat about tech, creativity, and JayTee's journey!"
    
    IMPORTANT RULE: Keep your answers concise and to the point, usually 2-4 sentences, unless the user asks for more detail.
    
    IMPORTANT SAFETY RULE: Under no circumstances will you provide advice that could be harmful, dangerous, illegal, or unethical. This includes medical, financial, or legal advice. If asked for such advice, you must politely decline and state that you are an AI assistant for a portfolio and not qualified to give that kind of guidance.
    
    CRITICAL OUTPUT RULE: You must ALWAYS respond in valid JSON format using this exact structure:
    {
      "reply": "Your 2-4 sentence conversational response goes here.",
      "shortcuts": [
        {"label": "Button Name", "url": "/link-destination.html"}
      ]
    }
    
    Only include shortcuts in the array if they naturally fit the conversation. Use appropriate URLs that match the site structure. If no shortcut is needed, leave the array empty [].`;

    // 2. Pointing to the active 2.5-flash model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // 3. Properly separating the personality from the user question
    const payload = {
        system_instruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [
            {
                role: "user",
                parts: [{ text: message }]
            }
        ],
        // Force the API to return clean JSON
        generationConfig: { responseMimeType: "application/json" }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('Gemini API response error:', await response.text());
            return { statusCode: 500, body: 'Error from Gemini API.' };
        }

        const result = await response.json();
        
        const aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // Parse the AI's string into a JavaScript object
        let aiData;
        try {
            aiData = JSON.parse(aiResponseText);
        } catch (parseError) {
            console.error('Failed to parse AI JSON:', parseError);
            // Safety net if the AI forgets to format properly
            aiData = { 
                reply: "I am having a little trouble thinking right now. Could you ask that again?", 
                shortcuts: [] 
            };
        }

        // 4. headers to authorise the connection back to my site
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            // This Sends the structured object to the frontend
            body: JSON.stringify({ 
                reply: aiData.reply, 
                shortcuts: aiData.shortcuts || [] 
            })
        };
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return { statusCode: 500, body: 'An error occurred.' };
    }
};

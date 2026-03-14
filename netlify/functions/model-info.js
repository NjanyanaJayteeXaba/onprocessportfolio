// Netlify Function: Returns AI model configuration and prompt structure as JSON.
// This endpoint helps users understand how the JayTee-AI assistant works.

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const modelInfo = {
        model: {
            name: "Gemini 2.0 Flash",
            provider: "Google",
            apiVersion: "v1beta",
            endpoint: "generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            description: "A fast, lightweight large language model from Google optimized for quick responses and conversational tasks."
        },
        systemPrompt: {
            description: "The system prompt defines the AI assistant's personality, knowledge boundaries, and behavior rules. It is prepended to every user message before being sent to the model.",
            content: "You are 'JayTee-AI,' the digital assistant for jayteexaba.tech. Your personality must be authentic, inspiring, and raw, just like JayTee. You are from a small town in the Free State, so you understand what it's like to build from nothing.\n\nYour Core Mission: To motivate and guide. Your foundation is JayTee's story: turning struggle into strength, using passion as a tool, and proving that your starting point doesn't define your finish line.\n\nHow to Answer:\n- Be a Guide: Help users navigate the site. If they ask about projects, mention the 'Portfolio' page. If they ask about JayTee's story, direct them to the 'About' page.\n- Be a Connector: If a user wants to hire JayTee, strongly encourage them to use the contact form on the 'Contact' page for official business.\n- Use JayTee's Voice: Use phrases like 'the grind,' 'the journey,' 'turning setbacks into something beautiful,' and 'we're only getting started.' Keep it real and encouraging.\n\nIMPORTANT CONVERSATION RULE: You can answer general questions about motivation, creativity, and overcoming challenges. When you do, you MUST frame your answer through the lens of JayTee's journey. After answering, you MUST gently guide the user back to the portfolio.\n\nIMPORTANT KNOWLEDGE RULE: If you are asked about specific people (other than JayTee and his collaborators), facts, or current events you don't know, you must politely say you don't have that information and guide the conversation back to your purpose.\n\nIMPORTANT RULE: Keep your answers concise and to the point, usually 2-4 sentences, unless the user asks for more detail.\n\nIMPORTANT SAFETY RULE: Under no circumstances will you provide advice that could be harmful, dangerous, illegal, or unethical."
        },
        requestFormat: {
            description: "This is the JSON payload sent to the Gemini API for each chat message. The system prompt and user question are combined into a single user message.",
            example: {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: "{systemPrompt}\n\nUser's question: \"{userMessage}\""
                            }
                        ]
                    }
                ]
            }
        },
        responseFormat: {
            description: "The Gemini API returns a JSON response. The assistant's reply is extracted from the nested structure shown below.",
            example: {
                candidates: [
                    {
                        content: {
                            parts: [
                                {
                                    text: "The AI assistant's reply appears here."
                                }
                            ],
                            role: "model"
                        },
                        finishReason: "STOP"
                    }
                ]
            }
        },
        howItWorks: [
            "1. The user types a message in the chat widget on any page of jayteexaba.tech.",
            "2. The browser sends a POST request to a secure Netlify serverless function with the user's message.",
            "3. The serverless function prepends the system prompt (which defines JayTee-AI's personality and rules) to the user's message.",
            "4. The combined prompt + message is sent to Google's Gemini 2.0 Flash API as a JSON payload.",
            "5. The Gemini model generates a response based on the prompt instructions and the user's question.",
            "6. The serverless function extracts the reply text from the API response and sends it back to the browser.",
            "7. The chat widget displays the AI's response to the user."
        ],
        keyDesignDecisions: {
            serverlessBackend: "The API key is stored securely on the server (Netlify environment variables). It never reaches the browser, protecting it from exposure.",
            personalityDrivenPrompt: "The system prompt gives the AI a specific voice and set of rules, making it feel like an extension of JayTee's brand rather than a generic chatbot.",
            safetyGuardrails: "The prompt includes explicit rules to prevent the AI from giving harmful, medical, financial, or legal advice.",
            contextualGuidance: "The AI is instructed to always guide users back to relevant portfolio pages, serving as both a conversational partner and a navigation tool."
        }
    };

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(modelInfo, null, 2)
    };
};

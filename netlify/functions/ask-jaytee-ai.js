// This is the code for secure Netlify Function.
// It runs on Netlify's servers, not in the browser.

const approvedLinks = {
    home: '/index.html',
    portfolio: '/pages/Portfolio-Page.html',
    about: '/pages/About-Page.html',
    services: '/pages/Services.html',
    contact: '/pages/Contact-Page.html',
    cv: 'https://njanyanajayteexaba.github.io/CV/'
};

const faqEntries = [
    {
        test: /(who\s+(made|created|built)\s+this|who\s+is\s+jaytee|about\s+jaytee|author|owner|creator|your\s+story)/i,
        reply: 'I am Njanyana "JayTee" Xaba, a South African creative technologist focused on building real solutions from the ground up. If you want the full story, visit the About page.',
        shortcuts: [{ label: 'Go to About', url: approvedLinks.about }]
    },
    {
        test: /(project|projects|portfolio|work|showcase|what\s+have\s+you\s+built)/i,
        reply: 'You can see my projects and featured work on the Portfolio page. That is the best place to explore the things I have built and how I approach each idea.',
        shortcuts: [{ label: 'Open Portfolio', url: approvedLinks.portfolio }]
    },
    {
        test: /(hire|contact|email|whatsapp|reach\s+out|get\s+in\s+touch|work\s+with\s+you)/i,
        reply: 'If you want to work with me, the Contact page is the best place to send a message. That keeps everything in one official place and makes it easy to respond properly.',
        shortcuts: [{ label: 'Contact Me', url: approvedLinks.contact }]
    },
    {
        test: /(service|services|what\s+do\s+you\s+do|what\s+can\s+you\s+help\s+with)/i,
        reply: 'My Services page breaks down the kind of work I focus on, including web development, creative digital work, and practical support for ideas that need structure.',
        shortcuts: [{ label: 'View Services', url: approvedLinks.services }]
    },
    {
        test: /(cv|resume|curriculum\s+vitae|download\s+cv)/i,
        reply: 'You can view my CV from the official CV link. It opens in a new tab and gives a quick overview of my background.',
        shortcuts: [{ label: 'Open CV', url: approvedLinks.cv }]
    },
    {
        test: /(home|start|main\s+page|landing\s+page)/i,
        reply: 'If you want to start from the beginning, the Home page is the best place to begin. It gives you a quick view of the portfolio and the main navigation paths.',
        shortcuts: [{ label: 'Go Home', url: approvedLinks.home }]
    }
];

const getFaqResponse = (message) => {
    for (const entry of faqEntries) {
        if (entry.test.test(message)) {
            return entry;
        }
    }

    if (/\b(hello|hi|hey|sup|good\s+morning|good\s+afternoon|good\s+evening)\b/i.test(message)) {
        return {
            reply: 'Hello. I can help with the site, the About page, the Portfolio page, Services, Contact, or the CV link.',
            shortcuts: [
                { label: 'About', url: approvedLinks.about },
                { label: 'Portfolio', url: approvedLinks.portfolio }
            ]
        };
    }

    return {
        reply: 'I do not have that information in the site content. If you want to learn about the author, go to the About page, or check the Portfolio page to see the projects.',
        shortcuts: [
            { label: 'About Page', url: approvedLinks.about },
            { label: 'Portfolio Page', url: approvedLinks.portfolio }
        ]
    };
};

exports.handler = async (event) => {
    const responseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const faqResponse = getFaqResponse(message);

    return jsonResponse(
        200,
        faqResponse.reply,
        Array.isArray(faqResponse.shortcuts) ? faqResponse.shortcuts : []
    );
};

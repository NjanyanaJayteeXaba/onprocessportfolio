const chatBubble = document.getElementById('chat-bubble');
const chatWindow = document.getElementById('chat-window');
const chatCloseButton = document.getElementById('chat-close-button');
const chatBody = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

const toggleChatWindow = () => {
    chatWindow.classList.toggle('active');
};

chatBubble.addEventListener('click', toggleChatWindow);
chatCloseButton.addEventListener('click', toggleChatWindow);

const sendMessage = async () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Lock the inputs immediately to prevent spamming
    chatInput.disabled = true;
    sendButton.disabled = true;

    addMessage(userMessage, 'user');
    chatInput.value = '';

    const loadingIndicator = addMessage('...', 'bot loading');

    try {
        const response = await fetch('/.netlify/functions/ask-jaytee-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const textBody = await response.text();
            data = { reply: textBody };
        }

        if (!response.ok) {
            throw new Error(data.reply || 'Network response was not ok.');
        }

        const botResponse = typeof data.reply === 'string' && data.reply.trim()
            ? data.reply
            : "I am having a little trouble thinking right now. Could you ask that again?";
        
        // Catch the shortcuts array from the backend
        const shortcuts = data.shortcuts || []; 

        loadingIndicator.remove();
        addMessage(botResponse, 'bot');

        // --- RENDER INTERACTIVE SHORTCUT BUTTONS ---
        if (shortcuts.length > 0) {
            const shortcutContainer = document.createElement('div');
            shortcutContainer.className = 'chat-shortcuts-container';

            shortcuts.forEach(shortcut => {
                const button = document.createElement('a');
                button.href = shortcut.url;
                button.className = 'chat-shortcut-btn';
                button.textContent = shortcut.label;
                shortcutContainer.appendChild(button);
            });

            chatBody.appendChild(shortcutContainer);
            // Force scroll to the bottom so the new buttons are visible
            chatBody.scrollTop = chatBody.scrollHeight; 
        }

    } catch (error) {
        console.error('Error:', error);
        loadingIndicator.remove();
        addMessage(error.message || "Sorry, something went wrong. The server might be busy. Please try again in a moment.", 'bot');
    } finally {
        // Unlock the inputs regardless of success or failure
        chatInput.disabled = false;
        sendButton.disabled = false;
        // Automatically put the cursor back in the input box
        chatInput.focus();
    }
};

const addMessage = (text, type) => {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${type}`;
    
    if (type.includes('loading')) {
        messageElement.innerHTML = '<div class="typing-indicator"><span></span></div>';
    } else {
        messageElement.textContent = text;
    }
    
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    return messageElement;
};

sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Auto-show help message after 10 seconds
let welcomeShown = false;
setTimeout(() => {
    if (!welcomeShown && !chatWindow.classList.contains('active')) {
        addMessage("Need help? Feel free to ask me anything about JayTee's work, services, or the site. I'm here to assist! 😊", 'bot');
        welcomeShown = true;
    }
}, 10000);

// Initialize elements when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const welcomeText = document.querySelector('.welcome-text');
    const text = "What can I help you with?";
    welcomeText.textContent = '';
    welcomeText.classList.add('typing-text');
    
    let charIndex = 0;
    function typeText() {
        if (charIndex < text.length) {
            welcomeText.textContent = text.slice(0, charIndex + 1);
            charIndex++;
            setTimeout(typeText, 100);
        } else {
            welcomeText.classList.remove('typing-text');
        }
    }
    
    setTimeout(typeText, 500);

    // Initialize suggestion functionality
    const suggestionItems = document.querySelectorAll('.suggestion-item');
    suggestionItems.forEach(item => {
        item.addEventListener('click', () => {
            const queryText = item.getAttribute('data-query');
            chatInput.value = queryText;
            chatInput.focus();
        });
    });
});

// Element references
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const logoutBtn = document.getElementById("logout-btn");
const initialState = document.getElementById("initial-state");
const chatInputContainer = document.getElementById("chat-input-container");

// Configuration
const CLIENT_ID = '678671148893-k2hokd3vq65bh5ot1er60pejop1bkcv3.apps.googleusercontent.com';
let isFirstMessage = true;

// Handle transition to chat interface
function transitionToChat() {
    if (isFirstMessage) {
        initialState.style.opacity = '0';
        setTimeout(() => {
            initialState.style.display = 'none';
            chatBox.classList.add('active');
            chatInputContainer.classList.remove('initial');
        }, 500);
        isFirstMessage = false;
    }
}

// Append messages to chat
function appendMessage(content, sender, isHTML = false) {
    if (isFirstMessage) {
        transitionToChat();
    }
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    if (isHTML) {
        messageContent.innerHTML = content;
    } else {
        messageContent.textContent = content;
    }
    
    messageDiv.appendChild(messageContent);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Process query through backend
function processQuery(userMessage) {
    fetch('/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            appendMessage("Error: " + data.error, "bot");
        } else if (data.downloadLink) {
            const downloadLink = `<a href="${data.downloadLink}" download>Download CSV</a>`;
            appendMessage("Your query result is ready. " + downloadLink, "bot", true);
        } else {
            appendMessage("No results or error occurred.", "bot");
        }
    })
    .catch(error => {
        appendMessage("An error occurred: " + error.message, "bot");
    });
}

// Event Listeners
sendBtn.addEventListener("click", () => {
    const userMessage = chatInput.value.trim();

    if (userMessage.toLowerCase() === "clear") {
        clearMessages();
        chatInput.value = '';
        return;
    }

    if (userMessage !== "") {
        appendMessage(userMessage, "user");
        chatInput.value = "";

        setTimeout(() => {
            appendMessage("Processing your query...", "bot");
            processQuery(userMessage);
        }, 500);
    }
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});

// Google Authentication handling
window.handleCredentialResponse = (response) => {
    console.log("Response from Google:", response);
    const data = jwt_decode(response.credential);
    console.log("User Data:", data);
    appendMessage(`Welcome, ${data.name}!`, "bot");
    document.querySelector(".g_id_signin").classList.add("hidden");
    logoutBtn.classList.remove("hidden");
};

logoutBtn.addEventListener("click", () => {
    appendMessage("You have been logged out.", "bot");
    document.querySelector(".g_id_signin").classList.remove("hidden");
    logoutBtn.classList.add("hidden");
});

// JWT decoding utility
function jwt_decode(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    console.log("Decoded JWT Payload:", jsonPayload);
    return JSON.parse(jsonPayload);
}

// Initialize chat input container
chatInputContainer.classList.add('initial');
chatInputContainer.style.opacity = '1'

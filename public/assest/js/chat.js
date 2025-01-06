const fetchResponse = async (message) => {
    try {
        const response = await fetch('https://icthelpmcicts-git-server-thisisdinethdnet.vercel.app/api/generate', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userQuery: message }),
        });

        if (!response.ok) throw new Error("Failed to fetch from backend.");
        const data = await response.json();
        let botMessage = data.response || "No response from server.";

        

        // Format bold text, italic, and links in the response
        botMessage = botMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        botMessage = botMessage.replace(/_(.*?)_/g, '<em>$1</em>'); // Italic
        botMessage = botMessage.replace(/https?:\/\/[^\s]+/g, (url) => `<a href="${url}" target="_blank" style="color: white;">${url}</a>`);

        // Handle code blocks and format them in a code box
        botMessage = botMessage.replace(/```(.*?)```/gs, (match, code) => {
            return `<pre><code class="language-python">${code.trim()}</code></pre>`; // Wrap in <pre> tag for code block
        });

        // Add paragraph tags for each line break
        botMessage = `<p>${botMessage.replace(/\n/g, '</p><p>')}</p>`;

        // Store the formatted response in chat memory
        chatMemory.push({ question: message, answer: botMessage });

        return botMessage;
    } catch (error) {
        console.error("Error:", error);
        return "System under maintenance.";
    }
};


// Initialize memory array to store user questions and bot responses
let chatMemory = [];
const chatBody = document.getElementById("chat-body");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Function to create a copy button
const createCopyButton = (text) => {
    const button = document.createElement("button");
    button.textContent = "Copy response";
    button.classList.add("copy-button");
    button.onclick = () => {
        const textToCopy = text.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert("Response copied to clipboard!"))
            .catch((err) => console.error("Failed to copy text: ", err));
    };
    return button;
};

// Disable/Enable the input field and buttons
const disableInput = (disable) => {
    userInput.disabled = disable;
    sendButton.disabled = disable;

    const sampleButtons = document.querySelectorAll('.sample-message-container button');
    sampleButtons.forEach((button) => {
        button.disabled = disable;
        button.style.cursor = disable ? "not-allowed" : "pointer";
    });

    sendButton.style.cursor = disable ? "not-allowed" : "pointer";
    userInput.style.cursor = disable ? "not-allowed" : "text";
};

// Function to add messages to the chat
const addMessage = (content, sender, isHTML = false) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);

    const avatar = document.createElement("img");
    avatar.classList.add("avatar");
    avatar.src = sender === "user" ? "./img/user.png" : "./img/club.png";

    const text = document.createElement("div");
    text.classList.add("text");

    if (isHTML) {
        text.innerHTML = content;
    } else {
        text.textContent = content;
    }

    const copyButton = createCopyButton(content);
    if (sender === "bot") {
        messageDiv.appendChild(copyButton);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(text);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

// Handle the user input
const handleUserMessage = async () => {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";

    disableInput(true); // Disable input while generating response
    addMessage("Typing...", "bot");

    const botMessage = await fetchResponse(message);
    chatBody.lastChild.remove(); // Remove typing indicator

    addMessage(botMessage, "bot", true);

    disableInput(false); // Re-enable input after response
};

// Event listeners for sending message
sendButton.addEventListener("click", handleUserMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserMessage();
});

// Automatically handle the initial query from index.html (using the URL parameter)
const urlParams = new URLSearchParams(window.location.search);
const userQuery = urlParams.get('query');

// If a query exists in the URL, populate the input field with it
if (userQuery) {
    userInput.value = userQuery; // Set the input value with the query from URL
    sessionStorage.setItem('query', userQuery); // Store it in sessionStorage
}
// Automatically send the query after 1 second
window.addEventListener("load", () => {
    setTimeout(() => {
        if (userQuery) {
            handleUserMessage(); // Trigger the message submission automatically
        }
    }, 100); // 1 second delay
});
// After page reload, clear the input field from sessionStorage
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('query'); // Clear sessionStorage when the page is refreshed
});
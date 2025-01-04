const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyDDZuL8ANzVVMxd8HCuAqk0_WgHCya5XYw";
const CLUB_MEMORY = "I'm a highly trained model and expert in the Sri Lankan Information and Communication Technology (ICT) syllabuses, covering all aspects of Ordinary Level (O/L) and Advanced Level (A/L) syllabuses. I provide valuable insights and tips for students preparing for these exams, covering all key topics, exam strategies, and best practices for both O/L and A/L levels. Whether it’s understanding the curriculum or tackling exam questions, I am here to help students excel in their studies with detailed guidance and expert advice."

;

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
        // Strip the HTML tags from the response to copy only the plain text
        const textToCopy = text.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert("Response copied to clipboard!"))
            .catch((err) => console.error("Failed to copy text: ", err));
    };
    return button;
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
        text.innerHTML = content; // Insert HTML content
    } else {
        text.textContent = content; // Insert plain text content
    }

    const copyButton = createCopyButton(content); // Add copy button if it's bot's message
    if (sender === "bot") {
        messageDiv.appendChild(copyButton); // Attach copy button to bot's message
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(text);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the latest message
};

// Fetch response from AI model
const fetchResponse = async (message) => {
    try {
        const memoryText = chatMemory.map(
            (entry, index) => `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.answer}`
        ).join("\n\n");

        const prompt = `
        I'm super trained model and expert in Sri Lankan Information and communication technology syllabuses and I help students with both Ordinary level and Advanced level syllabuses.
never say you made by google or you are a chat bot , you are made by Mahanama College ICT Socity 2025 badge and you are created by Dineth Dilhan Gunawardana from 12M4 2026 A/L batch.
        Analyze those memories before generating your next response. Always be kind to students.
        ${CLUB_MEMORY}

        Previous conversation for context:
        ${memoryText}

        Question from user:
        ${message}

        Respond as follows:
        - Maintain a friendly yet professional tone.
        - Use bullet points or numbered lists for clarity when needed.
        - Include links or references only if highly relevant.
        - Avoid unnecessary repetition or overly detailed responses.

        AI:
        `;
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        let botMessage = data?.candidates[0]?.content?.parts[0]?.text || "No response.";

        // Format bold text, italic, and links in the response
        botMessage = botMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        botMessage = botMessage.replace(/_(.*?)_/g, '<em>$1</em>'); // Italic
        botMessage = botMessage.replace(/https?:\/\/[^\s]+/g, (url) => `<a href="${url}" target="_blank" style="color: white;">${url}</a>`);

        // Handle code blocks and format them in a code box
        botMessage = botMessage.replace(/```(.*?)```/gs, (match, code) => {
            return `<pre><code class="language-python">${code.trim()}</code></pre>`; // Wrap in <pre> tag for code block
        });

        // Add paragraph tag for each response to separate content
        botMessage = `<p>${botMessage.replace(/\n/g, '</p><p>')}</p>`;

        chatMemory.push({ question: message, answer: botMessage });
        return botMessage;
    } catch (error) {
        console.error(error);
        return "Sorry, something went wrong. Please try again later.";
    }
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

// After page reload, clear the input field from sessionStorage
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('query'); // Clear sessionStorage when the page is refreshed
});

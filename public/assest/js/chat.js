const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyDDZuL8ANzVVMxd8HCuAqk0_WgHCya5XYw";
const CLUB_MEMORY = `You are an expert of Sri Lankan AL and O/L ICT.`;

let chatMemory = []; // To store conversation context
const chatBody = document.getElementById("chat-body");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Function to add a message
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

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(text);

    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

// Fetch response from Gemini API
const fetchResponse = async (message) => {
    try {
        const memoryText = chatMemory.map(
            (entry, index) => `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.answer}`
        ).join("\n\n");

        const prompt = `${CLUB_MEMORY}\n\n${memoryText}\n\nUser: ${message}\nAI:`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const botMessage = data.choices[0].text;
        chatMemory.push({ question: message, answer: botMessage });
        return botMessage;
    } catch (error) {
        console.error(error);
        return "Sorry, something went wrong. Please try again later.";
    }
};

// Handle user message
const handleUserMessage = async () => {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";

    addMessage("Typing...", "bot");
    const botMessage = await fetchResponse(message);
    chatBody.lastChild.remove(); // Remove "Typing..."
    addMessage(botMessage, "bot", true);
};

sendButton.addEventListener("click", handleUserMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserMessage();
});

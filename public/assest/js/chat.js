

const API_URL = process.env.API_URL;
const CLUB_MEMORY = process.env.CLUB_MEMORY;

        let chatMemory = []; // To store user questions and bot responses during the session
        const chatBody = document.getElementById("chat-body");
        const userInput = document.getElementById("user-input");
        const sendButton = document.getElementById("send-button");

        const addMessage = (content, sender, isHTML = false) => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", sender);

            const avatar = document.createElement("img");
            avatar.classList.add("avatar");
            avatar.src = sender === "user" ? "../public/assest/img/user.png" : "../public/assest/img/club.png";

            const text = document.createElement("div");
            text.classList.add("text");

            if (isHTML) {
                text.innerHTML = content; // Insert HTML content
            } else {
                text.textContent = content; // Insert plain text content
            }

            messageDiv.appendChild(avatar);
            messageDiv.appendChild(text);

            chatBody.appendChild(messageDiv);
            chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the latest message
        };

        const fetchResponse = async (message) => {
            try {
                const memoryText = chatMemory.map(
                    (entry, index) => `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.answer}`
                ).join("\n\n");

                const prompt = `
                I'm super trained model and expert in Sri Lankan Information and communication technology syllubues and you I helping students with it with both Oridinary level and Advanced level syllubuss  

                Analyse those memories before genrating your next reponses , always kind for students
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

                botMessage = botMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                botMessage = botMessage.replace(/https?:\/\/[^\s]+/g, (url) => `<a href="${url}" target="_blank" style="color: white;">${url}</a>`);

                chatMemory.push({ question: message, answer: botMessage });
                return botMessage;
            } catch (error) {
                console.error(error);
                return "Sorry, something went wrong. Please try again later.";
            }
        };

        const disableInput = (disable) => {
            userInput.disabled = disable; // Disable/Enable the input field
            sendButton.disabled = disable; // Disable/Enable the send button

            // Handle sample message buttons
            const sampleButtons = document.querySelectorAll('.sample-message-container button');
            sampleButtons.forEach((button) => {
                button.disabled = disable; // Disable/Enable sample buttons
                button.style.cursor = disable ? "not-allowed" : "pointer";
            });

            // Update styles for disabled state
            sendButton.style.cursor = disable ? "not-allowed" : "pointer";
            userInput.style.cursor = disable ? "not-allowed" : "text";
        };


        const handleUserMessage = async () => {
            const message = userInput.value.trim();
            if (!message) return;

            addMessage(message, "user");
            userInput.value = "";

            disableInput(true); // Disable input and sample buttons while generating response
            addMessage("Typing...", "bot");

            const botMessage = await fetchResponse(message);
            chatBody.lastChild.remove(); // Remove typing indicator

            addMessage(botMessage, "bot", true);

            disableInput(false); // Re-enable input and sample buttons after response is complete
        };



        const sendSampleMessage = (message) => {
            if (sendButton.disabled) return; // Prevent sending if input is disabled
            userInput.value = message;
            handleUserMessage();
        };


        sendButton.addEventListener("click", handleUserMessage);
        userInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleUserMessage();
        });

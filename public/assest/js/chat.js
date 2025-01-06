const fetchResponse = async (message) => {
    try {
        const response = await fetch('/api/generate', {  // Changed to the Vercel serverless endpoint
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


const urlParams = new URLSearchParams(window.location.search);
const userQuery = urlParams.get('query');

// Display user query
document.querySelector('#user-query').textContent = userQuery;

// Fetch response from Gemini AI API
fetch('https://gemini-api.example.com/ai-endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: userQuery })
})
.then(response => response.json())
.then(data => {
    document.querySelector('#ai-response').textContent = data.answer;
})
.catch(error => console.error('Error:', error));
// Add smooth scroll for the "Explore Features" button
document.querySelector('.cta-button').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('#features').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});
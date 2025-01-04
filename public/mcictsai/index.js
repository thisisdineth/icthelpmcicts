document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const uploadForm = document.getElementById("uploadForm");
  const progressBar = document.getElementById("progressBar");
  const resultDiv = document.getElementById("result");

  // Initialize button state
  analyzeBtn.disabled = true;

  // Enable Analyze button when an image is selected
  imageInput.addEventListener("change", () => {
    if (imageInput.files.length > 0) {
      displayImage(imageInput.files[0]);
      analyzeBtn.disabled = false;
    } else {
      analyzeBtn.disabled = true;
    }
  });

  // Handle form submission
  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (imageInput.files.length === 0) {
      M.toast({ html: "Please upload an image!" });
      return;
    }

    const file = imageInput.files[0];
    const reader = new FileReader();

    // Display progress bar
    reader.onloadstart = () => {
      progressBar.style.display = "block";
    };

    reader.onloadend = async () => {
      try {
        const base64Image = reader.result.split(",")[1];
        const apiKey = "AIzaSyDDZuL8ANzVVMxd8HCuAqk0_WgHCya5XYw"; // Replace with your actual API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Fetch API request
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: "What is this picture?" },
                  {
                    inline_data: {
                      mime_type: file.type,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          }),
        });

        // Hide progress bar
        progressBar.style.display = "none";

        // Handle response
        if (response.ok) {
          const data = await response.json();
          displayResult(data);
        } else {
          const errorText = await response.text();
          console.error("Error Response:", errorText);
          M.toast({ html: "Error analyzing the image!" });
          resultDiv.innerHTML = "<p>Error analyzing the image.</p>";
        }
      } catch (error) {
        progressBar.style.display = "none";
        console.error("Error:", error);
        M.toast({ html: "An unexpected error occurred!" });
        resultDiv.innerHTML = "<p>An unexpected error occurred.</p>";
      }
    };

    reader.readAsDataURL(file);
  });

  // Display the selected image
  function displayImage(file) {
    const imagePreview = document.getElementById("imagePreview");
    const reader = new FileReader();

    reader.onload = (event) => {
      imagePreview.innerHTML = `<img src="${event.target.result}" alt="Image Preview" style="max-width: 100%; height: auto;">`;
    };

    reader.readAsDataURL(file);
  }

  // Display the API result
  function displayResult(data) {
    const resultDiv = document.getElementById("result");

    if (data.candidates && data.candidates.length > 0) {
      const content = data.candidates[0].content.parts
        .map((part) => part.text)
        .join(" ");
      const safetyRatings = data.candidates[0].safetyRatings
        .map((rating) => `<li>${rating.category}: ${rating.probability}</li>`)
        .join("");

      resultDiv.innerHTML = `
        <h5>Analysis Result:</h5>
        <p>${content}</p>
        <h6>Safety Ratings:</h6>
        <ul>${safetyRatings}</ul>
      `;
    } else {
      resultDiv.innerHTML = "<p>No analysis results available.</p>";
    }
  }
});

document.getElementById("imageInput").addEventListener("change", function () {
  const imageInput = document.getElementById("imageInput");
  const analyzeBtn = document.getElementById("analyzeBtn");

  if (imageInput.files.length > 0) {
    displayImage(imageInput.files[0]);
    analyzeBtn.disabled = false;
  } else {
    analyzeBtn.disabled = true;
  }
});

document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const imageInput = document.getElementById("imageInput");
    const progressBar = document.getElementById("progressBar");
    const resultDiv = document.getElementById("result");

    if (imageInput.files.length === 0) {
      M.toast({ html: "Please upload an image!" });
      return;
    }

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onloadstart = function () {
      progressBar.style.display = "block";
    };

    reader.onloadend = async function () {
      const base64Image = reader.result.split(",")[1];
      const apiKey = "AIzaSyDV7AWgfuD1f3kke1aKDrGG-vRWlLr4Zzs";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
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
                      mime_type: "image/png",
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      progressBar.style.display = "none";

      if (response.ok) {
        const data = await response.json();
        displayResult(data);
      } else {
        M.toast({ html: "Error analyzing the image!" });
        resultDiv.innerHTML = "";
      }
    };

    reader.readAsDataURL(file);
  });

function displayImage(file) {
  const imagePreview = document.getElementById("imagePreview");
  const reader = new FileReader();

  reader.onload = function (event) {
    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Image Preview">`;
  };

  reader.readAsDataURL(file);
}

function displayResult(data) {
  const resultDiv = document.getElementById("result");
  const candidates = data.candidates;

  if (candidates && candidates.length > 0) {
    const content = candidates[0].content.parts[0].text;
    const safetyRatings = candidates[0].safetyRatings
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

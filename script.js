let promptInput = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let imageButton = document.querySelector("#image");
let fileInput = document.querySelector("#fileInput");

const API_URL = "httpsx://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyApADQHFM-Ho1Pmu_-xch9-CjmN5T5nYLE"; 

let user = { 
    message: null, 
    file: {
        mime_type: null,
        data: null
    }
};

// Function to call AI API and update chat response
async function generateResponse(aiChatBox) {
    let requestBody = {
        contents: [
            { 
                parts: [{ text: user.message }]
            }
        ]
    };

    if (user.file.data) {
        requestBody.contents[0].parts.push({
            inline_data: {
                mime_type: user.file.mime_type,
                data: user.file.data
            }
        });
    }

    let requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    };

    try {
        let response = await fetch(API_URL, requestOptions);
        let data = await response.json();
        console.log("API Response:", data);

        let aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI could not generate a response.";
        aiChatBox.querySelector(".ai-chat-area").innerHTML = aiText;
    } catch (error) {
        console.error("API Error:", error);
        aiChatBox.querySelector(".ai-chat-area").innerHTML = "Error fetching AI response.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        user.file={}
    }
}

// Function to create a chat message box
function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// Function to handle user chat input
function handleChatResponse(message) {
    if (!message.trim()) return;

    user.message = message;

    let userHtml = `<img src="user-image.webp" alt="" id="user-image" width="50">
                    <div class="user-chat-area">${message}
    ${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}"class="chooseimg" />` : ""}                
                    </div>`;

    let userChatBox = createChatBox(userHtml, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let aiHtml = `<img src="ai-3.jpg" alt="" id="ai-image" width="50">
                      <div class="ai-chat-area">AI is thinking...</div>`;

        let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);

        generateResponse(aiChatBox);
    }, 600);
}

// Event listener for Enter key
promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && promptInput.value.trim() !== "") {
        handleChatResponse(promptInput.value);
        promptInput.value = ""; 
    }
});

// Image button event listener
document.addEventListener("DOMContentLoaded", () => {
    if (!imageButton || !fileInput) {
        console.error("Image button or file input not found!");
        return;
    }

    imageButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function () {
                user.file.data = reader.result.split(",")[1]; // Extract base64 string
                user.file.mime_type = file.type;
                console.log("File ready to send:", user.file);
            };
            reader.readAsDataURL(file);
        } else {
            console.log("No file selected.");
        }
    });
});

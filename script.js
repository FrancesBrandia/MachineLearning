const URL = "https://teachablemachine.withgoogle.com/models/j75pvP-nK/"; // Your model URL

let model, labelContainer, maxPredictions;
let uploadedImage = null;  // Store the original image

// Initialize the model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Set up the label container for displaying predictions
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
            const predictionElement = document.createElement("div");
            labelContainer.appendChild(predictionElement);
        }

        // Enable the "Train Model" button once the page is loaded
        document.getElementById("trainButton").disabled = false;
    } catch (error) {
        console.error("Error loading the model:", error);
        alert("Failed to load the model. Please check the model URL.");
    }
}

// Simulate "training" the model and show the loading bar
function trainModel() {
    document.getElementById("trainButton").disabled = true;
    document.getElementById("loadingContainer").style.display = "block"; // Show loading
    const loadingBar = document.getElementById("loadingBar");

    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        loadingBar.value = progress;

        if (progress >= 100) {
            clearInterval(interval);
            document.getElementById("loadingContainer").style.display = "none"; // Hide loading
            document.getElementById("predictButton").disabled = false; // Enable prediction button
            alert("Training complete! You can now make predictions.");
        }
    }, 100);
}

// Handle the image upload
document.getElementById("imageUpload").addEventListener("change", handleImageUpload, false);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgElement = new Image();
            imgElement.src = e.target.result;

            // Once the image is loaded, we can display it
            imgElement.onload = function () {
                // Store the original uploaded image
                uploadedImage = imgElement;

                // Resize the image to 100x100 pixels for display
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = 100;
                canvas.height = 100;
                ctx.drawImage(imgElement, 0, 0, 100, 100); // Scale the image to fit within 100x100

                // Assign the canvas to uploadedImageCanvas
                const smallImg = new Image();
                smallImg.src = canvas.toDataURL(); // Convert canvas to image data URL
                smallImg.onclick = function() { openInNewWindow(uploadedImage.src) }; // Open the original image in new window
                const webcamContainer = document.getElementById("webcam-container");
                webcamContainer.innerHTML = ""; // Clear previous images
                webcamContainer.appendChild(smallImg);

                // Show the "Train Model" and "Run Prediction" buttons
                document.getElementById("trainButton").style.display = 'inline-block';
                document.getElementById("predictButton").style.display = 'inline-block';

                // Enable the prediction button
                document.getElementById("predictButton").disabled = false;
            };
        };
        reader.readAsDataURL(file);
    }
}

// Run prediction on the uploaded image when the "Run Prediction" button is clicked
async function runPrediction() {
    if (!uploadedImage) {
        alert("Please upload an image first!");
        return;
    }

    try {
        // Run prediction on the uploaded image canvas
        const prediction = await model.predict(uploadedImage);
        
        // Clear previous predictions
        labelContainer.innerHTML = "";

        // Display the new predictions
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction = prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(2) + "%";
            const predictionElement = document.createElement("div");
            predictionElement.textContent = classPrediction;
            labelContainer.appendChild(predictionElement);
        }
    } catch (error) {
        console.error("Prediction error:", error);
        alert("There was an error during prediction.");
    }
}

// Open the image in a new window at original size
function openInNewWindow(imageSrc) {
    // Open a new window with the full-size image
    const imageWindow = window.open("", "_blank", "width=800,height=600");
    imageWindow.document.write(`<img src="${imageSrc}" style="width: auto; height: auto; max-width: 100%; max-height: 100%;" />`);
}

// Initialize the model when the page loads
window.onload = init;

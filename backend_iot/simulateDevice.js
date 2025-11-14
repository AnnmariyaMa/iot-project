// 1. Import axios
const axios = require("axios");

// 2. Set your API endpoint URL
const API_URL = "http://localhost:5000/sensor-readings";

// 3. Create a fake sensor reading
const fakeReading = {
  sensor_id: 1,              // your sensor ID
  temperature: 28.7,         // example temperature
  humidity: 65,              // example humidity
  timestamp: new Date().toISOString() // current timestamp in ISO format
};

// 4. Function to send reading
async function sendReading(reading) {
  try {
    const response = await axios.post(API_URL, reading);
    console.log("Data sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending data:", error.message);
  }
}

// 5. Send the reading
sendReading(fakeReading); 




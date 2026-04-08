const axios = require("axios");

async function askLLM(userMessage) {
  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2:3b",
      prompt: `
You are an ecommerce chatbot.

Convert user input into JSON.

Actions:
- search_product
- add_to_cart
- remove_from_cart
- view_cart
- place_order

Return ONLY JSON.

User: ${userMessage}
      `,
      stream: false
    });

    return JSON.parse(response.data.response);
  } catch (error) {
    console.error("LLM Error:", error.message);
    return null;
  }
}

module.exports = { askLLM };
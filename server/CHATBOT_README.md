# Chatbot Python Service

This is a separate Python service for the e-commerce chatbot that uses Google's Gemini 1.5 Flash model to generate responses based on the guidelines in `chat_bot.txt`.

## Setup

1. Install Python 3.11+ if not already installed
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment: `.\venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Get a Google AI API key from https://makersuite.google.com/app/apikey
6. Replace `YOUR_API_KEY_HERE` in `chatbot.py` with your actual API key

## Usage

### As a standalone script
```python
from chatbot import get_chatbot_response

response = get_chatbot_response("I need a phone under 20000")
print(response)
```

### With chat history
```python
history = [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help you today?"}
]

response = get_chatbot_response("I need a laptop", history)
```

## Integration

This Python service is designed to be integrated with your Node.js website later. You can:

- Run it as a separate service on a different port
- Call it via subprocess from Node.js
- Convert it to a FastAPI/Flask API
- Use it as a library in your existing Python backend

## Files

- `chatbot.py`: Main chatbot logic using Gemini
- `requirements.txt`: Python dependencies
- `../chat_bot.txt`: Chatbot guidelines and examples
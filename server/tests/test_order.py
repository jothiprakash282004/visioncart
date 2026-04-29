import chatbot, json

# Simulate: user said "track my order", bot asked for order ID, now user replies with "2"
history = [
    {"role": "user",      "content": "track my order"},
    {"role": "assistant", "content": "Please enter your Order ID and I'll look it up right away!"}
]
r = chatbot.get_chatbot_response("20", history)
print("Multi-turn reply:", r["reply"])

# Also test with invalid ID
r2 = chatbot.get_chatbot_response("abc", history)
print("\nInvalid ID reply:", r2["reply"])

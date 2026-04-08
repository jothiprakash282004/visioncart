fetch("http://localhost:5000/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "i want a mobile", history: [] })
}).then(r => r.json()).then(console.log).catch(console.error);

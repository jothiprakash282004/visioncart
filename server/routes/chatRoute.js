const express = require("express");
const router = express.Router();
const { askLLM } = require("./ollamaService");

// Dummy DB function (replace later)
function searchProduct(filters) {
  return [
    { name: "Black Shoes", price: 1500 },
    { name: "Sports Shoes", price: 1800 }
  ];
}

router.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const actionData = await askLLM(userMessage);

  if (!actionData) {
    return res.json({ reply: "Something went wrong" });
  }

  let result;

  switch (actionData.action) {
    case "search_product":
      result = searchProduct(actionData);
      break;

    case "view_cart":
      result = "Cart is empty";
      break;

    default:
      result = "Action not supported yet";
  }

  res.json({
    action: actionData,
    result: result
  });
});

module.exports = router;
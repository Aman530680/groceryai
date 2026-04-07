const aiService = require('../services/aiService');

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'Messages are required' });

    const userContext = {
      name: req.user?.name,
      preferences: req.user?.preferences,
      ingredientHistory: req.user?.ingredientHistory?.slice(-10),
    };

    const reply = await aiService.chatWithAssistant(messages, userContext);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate recipes from a list of ingredients using OpenAI
 */
exports.generateRecipesFromIngredients = async (ingredients) => {
  const prompt = `You are a professional chef and nutritionist. Given these ingredients: ${ingredients.join(', ')}, suggest 3 recipes.

For each recipe return a JSON array with this exact structure:
[
  {
    "title": "Recipe Name",
    "description": "Brief description",
    "ingredients": [{"name": "ingredient", "quantity": "1", "unit": "cup"}],
    "steps": ["Step 1", "Step 2"],
    "cookTime": 30,
    "prepTime": 15,
    "servings": 2,
    "difficulty": "easy",
    "cuisine": "Italian",
    "tags": ["healthy", "quick"],
    "nutrition": {"calories": 350, "protein": 20, "carbs": 40, "fat": 10, "fiber": 5},
    "missingIngredients": ["ingredient not in user list"]
  }
]

Return ONLY valid JSON, no markdown, no explanation.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content.trim();
  return JSON.parse(content);
};

/**
 * Chat with AI cooking assistant
 */
exports.chatWithAssistant = async (messages, userContext = {}) => {
  const systemPrompt = `You are GroceryAI, an intelligent cooking and grocery shopping assistant. You help users:
- Find recipes based on available ingredients
- Suggest grocery items to buy
- Answer cooking questions
- Plan meals
- Track nutrition

User context: ${JSON.stringify(userContext)}

When users ask to add items to cart, respond with a JSON block like:
{"action": "ADD_TO_CART", "items": ["tomato", "onion"]}

Be friendly, concise, and helpful. If suggesting recipes, include key ingredients.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.8,
    max_tokens: 800,
  });

  return response.choices[0].message.content;
};

/**
 * Analyze image to detect ingredients
 */
exports.analyzeIngredientImage = async (base64Image) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'List all food ingredients you can see in this image. Return only a JSON array of ingredient names: ["ingredient1", "ingredient2"]',
          },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
        ],
      },
    ],
    max_tokens: 300,
  });

  const content = response.choices[0].message.content.trim();
  return JSON.parse(content);
};

const OpenAI = require('openai');
const Recipe = require('../models/Recipe');
const Product = require('../models/Product');

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Rule-based fallback (works without OpenAI) ──
const fallbackResponse = async (message) => {
  const msg = message.toLowerCase();

  if (/^(hi|hello|hey|namaste|good)/.test(msg))
    return "Hello! 👋 I'm GroceryAI! Ask me about recipes, ingredients, or what to cook today!";

  if (msg.includes('what can i cook') || msg.includes('cook with')) {
    const word = msg.split(' ').slice(-1)[0];
    const recipes = await Recipe.find({ 'ingredients.name': { $regex: word, $options: 'i' } }).limit(3);
    if (recipes.length)
      return `🍽️ Recipes you can make:\n${recipes.map((r, i) => `${i + 1}. ${r.title} (${r.difficulty}, ${r.cookTime + r.prepTime} min)`).join('\n')}\n\nWant me to add missing ingredients to your cart?`;
    return "🍳 Try our AI recipe generator on the Home page — enter your ingredients and get instant recipes!";
  }

  if (msg.includes('breakfast'))
    return "☀️ Quick breakfast ideas:\n• Scrambled eggs (5 min)\n• Overnight oats\n• Banana smoothie\n• Toast with avocado\n\nAll ingredients in our Shop!";

  if (msg.includes('lunch') || msg.includes('dinner'))
    return "🍽️ Great meal ideas:\n• Chicken stir-fry with rice\n• Pasta bolognese\n• Lentil curry\n• Salmon with vegetables\n\nCheck our Recipes page for full instructions!";

  if (msg.includes('healthy') || msg.includes('diet')) {
    const recipes = await Recipe.find({ tags: { $in: ['healthy', 'vegan'] } }).limit(3);
    if (recipes.length)
      return `🥗 Healthy options:\n${recipes.map((r, i) => `${i + 1}. ${r.title} — ${r.nutrition?.calories || '?'} cal`).join('\n')}`;
    return "🥗 Healthy picks: lentil soup, Greek salad, grilled chicken, overnight oats. All recipes on our Recipes page!";
  }

  if (msg.includes('vegan') || msg.includes('vegetarian'))
    return "🌱 Plant-based options:\n• Tofu vegetable curry\n• Lentil soup\n• Greek salad\n• Overnight oats\n\nAll ingredients available in our shop!";

  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    const products = await Product.find({ isActive: true }).sort({ price: 1 }).limit(5);
    if (products.length)
      return `💰 Best prices:\n${products.map((p) => `• ${p.name} — $${p.price}/${p.unit}`).join('\n')}\n\nVisit our Shop for all products!`;
  }

  if (msg.includes('add to cart') || msg.includes('buy') || msg.includes('order'))
    return `🛒 To add items:\n1. Go to Shop page\n2. Click "+ Cart" on any product\n\nOr use the AI recipe generator — it auto-adds missing ingredients! 🤖\n{"action": "ADD_TO_CART", "items": []}`;

  if (msg.includes('recipe')) {
    const term = msg.replace(/recipe for|recipe|how to make/gi, '').trim();
    if (term.length > 2) {
      const recipe = await Recipe.findOne({ title: { $regex: term, $options: 'i' } });
      if (recipe)
        return `📖 **${recipe.title}**\n⏱ ${recipe.prepTime + recipe.cookTime} min | 👥 ${recipe.servings} servings\n🥗 Ingredients: ${recipe.ingredients?.slice(0, 4).map((i) => i.name).join(', ')}\n\nFull recipe on our Recipes page!`;
    }
    return "🍳 Search recipes on our Recipes page, or use the AI generator on the Home page!";
  }

  if (msg.includes('thank'))
    return "😊 You're welcome! Happy cooking! 🥦";

  if (msg.includes('help') || msg.includes('what can you do'))
    return `🤖 I can help with:\n🍳 Recipes — "What can I cook with eggs?"\n🛒 Shopping — "Add pasta ingredients to cart"\n🥗 Healthy eating — "Give me a healthy dinner"\n💰 Prices — "How much is chicken?"\n🌱 Diet — "Show me vegan recipes"\n\nJust ask!`;

  return `🤖 I'm here to help with cooking & groceries! Try:\n• "What can I cook with rice and eggs?"\n• "Give me a healthy breakfast"\n• "Show me vegan recipes"\n\nOr visit our Recipes page! 🍽️`;
};

// ── OpenAI chat ──
exports.chatWithAssistant = async (messages, userContext = {}) => {
  const lastMessage = messages[messages.length - 1]?.content || '';

  const hasKey = process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== '<your_openai_api_key>' &&
    process.env.OPENAI_API_KEY.startsWith('sk-');

  if (!hasKey) return await fallbackResponse(lastMessage);

  try {
    const systemPrompt = `You are GroceryAI 🥦, a friendly cooking and grocery shopping assistant.
You help users find recipes, suggest groceries, answer cooking questions, and plan meals.
User context: ${JSON.stringify(userContext)}
Rules:
- Be friendly and concise (under 120 words)
- Use emojis
- When user asks to add items to cart, end response with: {"action": "ADD_TO_CART", "items": ["item1"]}
- Suggest visiting /recipes or /products pages when relevant`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
      temperature: 0.8,
      max_tokens: 400,
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.log('OpenAI error, using fallback:', err.message);
    return await fallbackResponse(lastMessage);
  }
};

// ── Recipe generation ──
exports.generateRecipesFromIngredients = async (ingredients) => {
  const hasKey = process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== '<your_openai_api_key>' &&
    process.env.OPENAI_API_KEY.startsWith('sk-');

  // Try DB first
  const dbRecipes = await Recipe.find({
    'ingredients.name': { $in: ingredients.map((i) => new RegExp(i, 'i')) },
  }).limit(3);

  if (!hasKey) {
    if (dbRecipes.length) {
      return dbRecipes.map((r) => ({
        ...r.toObject(),
        missingIngredients: r.ingredients
          .filter((ing) => !ingredients.some((i) => ing.name.toLowerCase().includes(i.toLowerCase())))
          .map((ing) => ing.name),
      }));
    }
    return [{
      title: `Quick ${ingredients[0]} Dish`,
      description: `A simple recipe using ${ingredients.join(', ')}`,
      ingredients: ingredients.map((i) => ({ name: i, quantity: '1', unit: 'cup' })),
      steps: ['Prepare all ingredients', 'Cook on medium heat for 15 minutes', 'Season with salt and pepper', 'Serve hot'],
      cookTime: 20, prepTime: 10, servings: 2, difficulty: 'easy',
      cuisine: 'International', tags: ['quick', 'easy'],
      nutrition: { calories: 350, protein: 20, carbs: 40, fat: 10, fiber: 5 },
      missingIngredients: ['olive oil', 'salt', 'pepper'],
    }];
  }

  try {
    const prompt = `You are a professional chef. Given these ingredients: ${ingredients.join(', ')}, suggest 3 recipes.
Return ONLY valid JSON array (no markdown):
[{"title":"","description":"","ingredients":[{"name":"","quantity":"","unit":""}],"steps":[""],"cookTime":30,"prepTime":15,"servings":2,"difficulty":"easy","cuisine":"","tags":[""],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"missingIngredients":[""]}]`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content.trim()
      .replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(content);
  } catch (err) {
    console.log('Recipe generation fallback:', err.message);
    if (dbRecipes.length) return dbRecipes.map((r) => ({ ...r.toObject(), missingIngredients: [] }));
    return [{
      title: `${ingredients[0]} Special`,
      description: `Made with ${ingredients.join(', ')}`,
      ingredients: ingredients.map((i) => ({ name: i, quantity: '1', unit: 'piece' })),
      steps: ['Prepare ingredients', 'Cook for 20 minutes', 'Serve hot'],
      cookTime: 20, prepTime: 10, servings: 2, difficulty: 'easy',
      cuisine: 'International', tags: ['quick'],
      nutrition: { calories: 300, protein: 15, carbs: 35, fat: 8, fiber: 4 },
      missingIngredients: [],
    }];
  }
};

// ── Image ingredient detection ──
exports.analyzeIngredientImage = async (base64Image) => {
  const hasKey = process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== '<your_openai_api_key>' &&
    process.env.OPENAI_API_KEY.startsWith('sk-');

  if (!hasKey) return ['tomato', 'onion', 'garlic', 'potato'];

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'List all food ingredients visible. Return ONLY a JSON array: ["ingredient1", "ingredient2"]' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
        ],
      }],
      max_tokens: 300,
    });
    return JSON.parse(response.choices[0].message.content.trim());
  } catch {
    return ['tomato', 'onion', 'garlic'];
  }
};

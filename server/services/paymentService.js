const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (amount, currency = 'usd') => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to cents
    currency,
    automatic_payment_methods: { enabled: true },
  });
  return paymentIntent;
};

exports.constructWebhookEvent = (payload, sig) => {
  return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
};

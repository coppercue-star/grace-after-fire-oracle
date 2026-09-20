// Creates a Stripe Checkout session for the Premium subscription.
// Called by the app when someone taps "Unlock Premium".
const Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { email, userId } = JSON.parse(event.body);
    if (!email || !userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing email or userId" }) };
    }

    const origin = event.headers.origin || process.env.URL;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
      metadata: { supabase_user_id: userId },
      subscription_data: { metadata: { supabase_user_id: userId } },
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error("Checkout session error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

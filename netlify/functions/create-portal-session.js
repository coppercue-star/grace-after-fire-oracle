// Opens Stripe's hosted Billing Portal so a Premium subscriber can manage
// or cancel their subscription without needing a custom UI for it.
const Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { customerId } = JSON.parse(event.body);
    if (!customerId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing customerId" }) };
    }
    const origin = event.headers.origin || process.env.URL;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error("Portal session error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

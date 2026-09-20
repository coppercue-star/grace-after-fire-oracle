// Listens for Stripe subscription events and keeps the Supabase "subscribers"
// table in sync. This is what actually makes isPremiumUser true or false.
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const sig = event.headers["stripe-signature"];
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const obj = stripeEvent.data.object;

  async function upsertSubscriber({ userId, email, customerId, status, periodEnd }) {
    if (!userId) return;
    await supabase.from("subscribers").upsert(
      {
        user_id: userId,
        email: email || null,
        stripe_customer_id: customerId || null,
        status: status || "unknown",
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  try {
    if (stripeEvent.type === "checkout.session.completed") {
      const userId = obj.metadata?.supabase_user_id;
      const subscription = await stripe.subscriptions.retrieve(obj.subscription);
      await upsertSubscriber({
        userId,
        email: obj.customer_email,
        customerId: obj.customer,
        status: subscription.status,
        periodEnd: subscription.current_period_end,
      });
    }

    if (stripeEvent.type === "customer.subscription.updated" || stripeEvent.type === "customer.subscription.deleted") {
      const userId = obj.metadata?.supabase_user_id;
      await upsertSubscriber({
        userId,
        customerId: obj.customer,
        status: obj.status,
        periodEnd: obj.current_period_end,
      });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

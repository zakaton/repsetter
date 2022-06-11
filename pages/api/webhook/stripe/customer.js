/* eslint-disable camelcase */
import { buffer } from "micro";
import Stripe from "stripe";
import { getSupabaseService } from "../../../../utils/supabase";

const webhookSecret = process.env.STRIPE_CUSTOMER_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = getSupabaseService();

  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case "customer.subscription.deleted":
      case "customer.subscription.deleted":
        {
          const { metadata } = event.data.object;
          const { data: subscription } = await supabase
            .from("subscription")
            .select("*")
            .eq("id", metadata.subscription)
            .single();
          if (subscription) {
            // FILL
          }
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

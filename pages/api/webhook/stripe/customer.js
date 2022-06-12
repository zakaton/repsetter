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
    console.log("event", event);

    switch (event.type) {
      case "customer.subscription.deleted":
      case "customer.subscription.deleted":
        {
          const { metadata } = event.data.object;
          console.log("metadata", metadata);
          const { data: subscription } = await supabase
            .from("subscription, client(*), coach(*)")
            .select("*")
            .eq("id", metadata.subscription)
            .single();
          console.log("subscription", subscription);
          if (subscription) {
            const coaches = subscription.client.coaches || [];
            if (
              !coaches.includes(subscription.coach.id) &&
              subscription.coach.can_coach
            ) {
              coaches.push(subscription.coach.id);
            }
            console.log("coaches", coaches);
            await supabase
              .from("profile")
              .update({ coaches })
              .eq("id", subscription.client.id);
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

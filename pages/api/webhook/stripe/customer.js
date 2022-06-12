/* eslint-disable camelcase */
import { buffer } from "micro";
import Stripe from "stripe";
import { getSupabaseService } from "../../../../utils/supabase";
import sendEmail from "../../../../utils/send-email";

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
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        {
          const { object } = event.data;
          const { metadata } = object;
          console.log("metadata", metadata);
          const { data: subscription } = await supabase
            .from("subscription")
            .select("*, client(*), coach(*)")
            .eq("id", metadata.subscription)
            .single();
          console.log("subscription", subscription);

          const { data: client } = await supabase
            .from("profile")
            .select("*")
            .eq("id", metadata.client)
            .single();
          console.log("client", client);
          if (subscription && client) {
            const coaches = client.coaches || [];
            if (object.status === "active") {
              if (
                !coaches.includes(subscription.coach.id) &&
                subscription.coach.can_coach
              ) {
                coaches.push(subscription.coach.id);
              }
              if (!subscription.is_active) {
                await supabase
                  .from("subscription")
                  .update({
                    client: client.id,
                    redeemed: true,
                    is_active: true,
                  })
                  .eq("id", subscription.id);
                // FILL - emails
              }
            }
            console.log("coaches", coaches);
            const updateClientResponse = await supabase
              .from("profile")
              .update({ coaches })
              .eq("id", client.id);
            console.log("updateClientResponse", updateClientResponse);
          } else {
            if (coaches.includes(subscription.coach.id)) {
              coaches.splice(coaches.indexOf(subscription.coach.id), 1);
            }
            if (subscription.is_active) {
              await supabase
                .from("subscription")
                .update({ is_active: false })
                .eq("id", subscription.id);
              // FILL - emails
            }
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

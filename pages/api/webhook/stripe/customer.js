/* eslint-disable camelcase */
import { buffer } from "micro";
import Stripe from "stripe";
import { getSupabaseService } from "../../../../utils/supabase";
import sendEmail from "../../../../utils/send-email";
import { formatDollars } from "../../../../utils/subscription-utils";

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

          if (subscription && event.type === "customer.subscription.created") {
            if (!subscription.stripe_id) {
              await supabase
                .from("subscription")
                .update({
                  stripe_id: object.id,
                })
                .eq("id", subscription.id);
            }
          }

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
                    client_email: client.email,
                    redeemed: true,
                    redeemed_at: new Date(),
                    is_active: true,
                  })
                  .eq("id", subscription.id);

                if (
                  subscription.coach.notifications?.includes(
                    "email_subscription_created_coach"
                  )
                ) {
                  await sendEmail({
                    to: subscription.coach.email,
                    subject: "You got a new Client!",
                    dynamicTemplateData: {
                      heading: `${client.email} is now a Client!`,
                      body: `${client.email} has agreed to pay ${formatDollars(
                        subscription.price,
                        false
                      )}/month for your coaching services.`,
                    },
                  });
                }

                if (
                  client.notifications?.includes(
                    "email_subscription_created_client"
                  )
                ) {
                  await sendEmail({
                    to: client.email,
                    subject: "You got a new Coach!",
                    dynamicTemplateData: {
                      heading: `${subscription.coach.email} is now a Coach!`,
                      body: `You've has agreed to pay ${formatDollars(
                        subscription.price,
                        false
                      )}/month to ${
                        subscription.coach.email
                      } for their coaching services.`,
                    },
                  });
                }
              }
            }

            if (event.type === "customer.subscription.updated") {
              if (object.cancel_at_period_end !== subscription.is_cancelled) {
                await supabase
                  .from("subscription")
                  .update({
                    is_cancelled: object.cancel_at_period_end,
                  })
                  .eq("id", subscription.id);

                if (
                  subscription.coach.notifications?.includes(
                    "email_subscription_cancelled_coach"
                  )
                ) {
                  await sendEmail({
                    to: subscription.coach.email,
                    subject: "A Client has cancelled their Subscription",
                    dynamicTemplateData: {
                      heading: `${client.email} has cancelled their Subscription`,
                      body: `You will still be able to coach ${client.email} until the end of the billing cycle`,
                    },
                  });
                }
                if (
                  client.notifications?.includes(
                    "email_subscription_cancelled_client"
                  )
                ) {
                  await sendEmail({
                    to: client.email,
                    subject: "Your Subscription has been cancelled",
                    dynamicTemplateData: {
                      heading: `Your Subscription to ${subscription.coach.email} has been cancelled`,
                      body: `You will still have access to ${subscription.coach.email}'s coaching until the end of the billing cycle`,
                    },
                  });
                }
              }
            }

            console.log("coaches", coaches);
            const updateClientResponse = await supabase
              .from("profile")
              .update({ coaches })
              .eq("id", client.id);
            console.log("updateClientResponse", updateClientResponse);
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

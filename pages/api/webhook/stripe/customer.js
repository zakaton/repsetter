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
                    is_cancelled: oject.cancel_at_period_end,
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
                    subject: "You've cancelled your Subscription",
                    dynamicTemplateData: {
                      heading: `You've cancelled your Subscription to ${subscription.coach.email}`,
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
          } else {
            if (coaches.includes(subscription.coach.id)) {
              coaches.splice(coaches.indexOf(subscription.coach.id), 1);
            }
            if (subscription.is_active) {
              await supabase
                .from("subscription")
                .update({ is_active: false })
                .eq("id", subscription.id);

              if (
                subscription.coach.notifications?.includes(
                  "email_subscription_ended_coach"
                )
              ) {
                await sendEmail({
                  to: subscription.coach.email,
                  subject: "A Client's subscription has ended",
                  dynamicTemplateData: {
                    heading: `${client.email}'s subscription has ended`,
                    body: `${client.email} has not renewed their subscription and so you will no longer be coaching them.`,
                  },
                });
              }

              if (
                client.notifications?.includes(
                  "email_subscription_ended_client"
                )
              ) {
                await sendEmail({
                  to: subscription.coach.email,
                  subject: "Your subscription has ended",
                  dynamicTemplateData: {
                    heading: `Your subscription to ${subscription.coach.email}'s coaching has ended`,
                    body: `You've not not renewed your subscription and so you will no longer be coached by ${subscription.coach.email}`,
                  },
                });
              }
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

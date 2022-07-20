/* eslint-disable camelcase */
import { buffer } from "micro";
import Stripe from "stripe";
import { getSupabaseService } from "../../../../utils/supabase";

const webhookSecret = process.env.STRIPE_ACCOUNT_WEBHOOK_SECRET;

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
      case "account.updated":
        {
          const account = event.data.object;
          const { data: profile } = await supabase
            .from("profile")
            .select("*")
            .eq("stripe_account", account.id)
            .single();
          if (profile) {
            const has_completed_onboarding = account.details_submitted;
            const can_coach = account.charges_enabled;
            const updates = {};
            let needsUpdate = false;
            if (profile.has_completed_onboarding !== has_completed_onboarding) {
              updates.has_completed_onboarding = has_completed_onboarding;
              needsUpdate = true;
            }
            if (profile.can_coach !== can_coach) {
              updates.can_coach = can_coach;
              const product = await stripe.products.create({
                name: `Coaching by ${profile.email}`,
                default_price_data: { currency: "usd", unit_amount: 0 },
                images: [
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/coach-picture/${profile.id}.jpg`,
                  "https://www.repsetter.com/images/logo.png",
                ],
              });
              updates.product_id = product.id;
              updates.default_price_id = product.default_price;

              needsUpdate = true;
            }
            if (needsUpdate) {
              await supabase
                .from("profile")
                .update(updates)
                .eq("stripe_account", account.id);
            }
          }
        }
        break;
      default:
        console.log(`Unhandled Event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

/* eslint-disable camelcase */
/* eslint-disable consistent-return */
import Stripe from "stripe";
import { getSupabaseService, getUserProfile } from "../../../utils/supabase";
import absoluteUrl from "next-absolute-url";
import { repsetterFeePercentage } from "../../../utils/subscription-utils";

export default async function handler(req, res) {
  if (!req.query.subscriptionId) {
    return sendError({ message: "No subscription was specified" });
  }
  const { subscriptionId } = req.query;

  const sendError = (error) => {
    return res.redirect(`/subscription/${subscriptionId}`);
    return res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to Redeem Coaching Subscription",
        ...error,
      },
    });
  };

  const supabase = getSupabaseService();
  const { user } = await supabase.auth.api.getUser(req.query.access_token);
  if (!user) {
    return sendError({ message: "You're not signed in" });
  }

  const { data: subscription } = await supabase
    .from("subscription")
    .select("*, coach(*)")
    .match({ id: subscriptionId })
    .single();

  if (subscription) {
    if (subscription.coach.id === user.id) {
      return sendError({ message: "you can't subscribe to yourself" });
    }

    const { data: existingSubscription } = await supabase
      .from("subscription")
      .select("*")
      .match({ client: user.id, coach: subscription.coach.id })
      .maybeSingle();
    if (existingSubscription) {
      return sendError({ message: "You're already subscribed to this coach" });
    }

    const { origin } = absoluteUrl(req);

    const profile = await getUserProfile(user, supabase);
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    console.log(subscription.price_id);
    if (subscription.price === 0) {
      const stripeSubscription = await stripe.subscriptions.create({
        customer: profile.stripe_customer,
        items: [{ price: subscription.price_id }],
        metadata: { subscription: subscription.id, client: profile.id },
        transfer_data: {
          destination: subscription.coach.stripe_account,
          amount_percent: repsetterFeePercentage,
        },
      });
      res.redirect(`/subscription/${subscriptionId}`);
    } else {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: profile.stripe_customer,

        line_items: [
          {
            price: subscription.price_id,
            quantity: 1,
          },
        ],
        subscription_data: {
          application_fee_percent: repsetterFeePercentage,
          transfer_data: {
            destination: subscription.coach.stripe_account,
          },
          metadata: { subscription: subscription.id, client: profile.id },
        },

        success_url: `${origin}/subscription/${subscription.id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscription/${subscription.id}`,
      });

      console.log("checkout session", session);
      res.redirect(session.url);
    }
  } else {
    return sendError({ message: "subscription not found" });
  }
}

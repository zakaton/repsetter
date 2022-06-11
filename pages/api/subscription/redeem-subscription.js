/* eslint-disable camelcase */
/* eslint-disable consistent-return */
import Stripe from "stripe";
import { getSupabaseService, getUserProfile } from "../../../utils/supabase";
import absoluteUrl from "next-absolute-url";

export default async function handler(req, res) {
  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to Redeem Coaching Subscription",
        ...error,
      },
    });

  const supabase = getSupabaseService();
  const { user } = await supabase.auth.api.getUser(req.query.access_token);
  if (!user) {
    return sendError({ message: "You're not signed in" });
  }
  if (!req.query.subscriptionId) {
    return sendError({ message: "No subscription was specified" });
  }
  const { subscriptionId } = req.query;

  const { data: subscription } = await supabase
    .from("subscription")
    .select("*")
    .match({ id: subscriptionId })
    .single();

  if (subscription) {
    if (subscription.coach === user.id) {
      return sendError({ message: "you can't subscribe to yourself" });
    }

    const { data: existingSubscription } = await supabase
      .from("subscription")
      .select("*")
      .match({ client: user.id, coach: subscription.coach })
      .maybeSingle();
    if (existingSubscription) {
      return sendError({ message: "You're already subscribed to this coach" });
    }

    const { origin } = absoluteUrl(req);

    const profile = await getUserProfile(user, supabase);
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: subscription.price_id,
          quantity: 1,
        },
      ],

      customer: profile.stripe_customer,

      success_url: `${origin}/subscription/${subscription.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription/${subscription.id}`,
    });

    console.log("checkout session", session);
    res.redirect(session.url);
  } else {
    return sendError({ message: "subscription not found" });
  }
}

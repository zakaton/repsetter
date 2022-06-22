/* eslint-disable camelcase */
/* eslint-disable consistent-return */
import {
  getSupabaseService,
  isUserAdmin,
  getUserByAccessToken,
} from "../../../utils/supabase";
import Stripe from "stripe";

export default async function handler(req, res) {
  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to Cancel Subscription",
        ...error,
      },
    });

  const supabase = getSupabaseService();
  const { user } = await getUserByAccessToken(supabase, req);
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

  if (subscription && (subscription.client === user.id || isUserAdmin(user))) {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const cancelledStripeSubscription = await stripe.subscriptions.del(
      subscription.stripe_id
    );
    console.log("cancelledStripeSubscription", cancelledStripeSubscription);

    res.status(200).json({
      status: {
        type: "succeeded",
        title: "Successfully cancelled subscription",
      },
    });
  } else {
    return sendError({ message: "Subscription isn't yours or doesn't exit" });
  }
}

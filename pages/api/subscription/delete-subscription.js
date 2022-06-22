/* eslint-disable camelcase */
/* eslint-disable consistent-return */
import {
  getSupabaseService,
  getUserProfile,
  isUserAdmin,
  getUserByAccessToken,
} from "../../../utils/supabase";
import Stripe from "stripe";

import { updateNumberOfUnredeemedSubscriptions } from "../../../utils/subscription-utils";

export default async function handler(req, res) {
  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to Delete Subscription",
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
    .select("*, client(*), coach(*)")
    .match({ id: subscriptionId })
    .single();

  if (
    subscription &&
    (subscription.coach.id === user.id ||
      subscription.client.id === user.id ||
      isUserAdmin(user))
  ) {
    const profile = await getUserProfile(user, supabase);

    if (subscription.redeemed && subscription.client) {
      const { client } = subscription;
      if (client.coaches?.includes(subscription.coach.id)) {
        const coaches = client.coaches || [];
        coaches.splice(coaches.indexOf(subscription.coach.id), 1);

        console.log("updated coaches", coaches);
        const updateClientResponse = await supabase
          .from("profile")
          .update({ coaches })
          .eq("id", client.id);
        console.log("updateClientResponse", updateClientResponse);
      }

      const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
      const cancelledStripeSubscription = await stripe.subscriptions.del(
        subscription.stripe_id
      );
      console.log("cancelledStripeSubscription", cancelledStripeSubscription);
    }

    const deleteSubscriptionResult = await supabase
      .from("subscription")
      .delete()
      .eq("id", subscriptionId);
    console.log("delete subscription result", deleteSubscriptionResult);

    await updateNumberOfUnredeemedSubscriptions(subscription.coach, supabase);

    res.status(200).json({
      status: { type: "succeeded", title: "Successfully deleted subscription" },
    });
  } else {
    return sendError({ message: "Subscription isn't yours or doesn't exit" });
  }
}

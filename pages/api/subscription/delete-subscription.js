/* eslint-disable camelcase */
/* eslint-disable consistent-return */
import {
  getSupabaseService,
  getUserProfile,
  isUserAdmin,
  getUserByAccessToken,
} from "../../../utils/supabase";

import { updateNumberOfSubscriptions } from "../../../utils/subscription-utils";

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
    .select("*")
    .match({ id: subscriptionId })
    .single();

  if (subscription && (subscription.coach === user.id || isUserAdmin(user))) {
    const profile = await getUserProfile(user, supabase);
    await updateNumberOfSubscriptions(profile, supabase);

    const deleteSubscriptionResult = await supabase
      .from("subscription")
      .delete()
      .eq("id", subscriptionId);
    console.log("delete subscription result", deleteSubscriptionResult);

    res.status(200).json({
      status: { type: "succeeded", title: "Successfully deleted subscription" },
    });
  } else {
    return sendError({ message: "Subscription isn't yours or doesn't exit" });
  }
}

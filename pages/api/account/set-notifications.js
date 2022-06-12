/* eslint-disable consistent-return */
import {
  getSupabaseService,
  getUserProfile,
  getUserByAccessToken,
} from "../../../utils/supabase";

export const notificationTypes = [
  {
    value: "email_subscription_created_client",
    title: "New Coach",
    description: "Be notified when you get a new coach",
  },
  {
    value: "email_subscription_cancelled_client",
    title: "Cancelled Subscription",
    description: "Be notified when your subscription is cancelled",
  },
  {
    value: "email_subscription_ended_client",
    title: "Subscription Ends",
    description: "Be notified when your subscription ends",
  },

  {
    value: "email_subscription_created_coach",
    title: "New Client",
    description: "Be notified when you get a new client",
  },
  {
    value: "email_subscription_cancelled_coach",
    title: "Client Cancelled",
    description: "Be notified when a client has cancelled their subscription",
  },
  {
    value: "email_subscription_ended_coach",
    title: "Client's Subscription Ends",
    description: "Be notified when a client's subscription ends",
  },
];

export default async function handler(req, res) {
  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to Update Notifications",
        ...error,
      },
    });

  const supabase = getSupabaseService();
  const { user } = await getUserByAccessToken(supabase, req);
  if (!user) {
    return sendError({ message: "You are not signed in" });
  }

  const profile = await getUserProfile(user, supabase);
  if (!profile) {
    return sendError({ message: "profile not found" });
  }

  const notifications = notificationTypes
    .filter((notificationType) => req.body[notificationType.value] === "on")
    .map(({ value }) => value);
  await supabase.from("profile").update({ notifications }).eq("id", profile.id);

  res.status(200).json({
    status: {
      type: "succeeded",
      title: "Successfully Updated Notifications",
    },
  });
}

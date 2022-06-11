/* eslint-disable consistent-return */
import Stripe from "stripe";
import {
  getSupabaseService,
  getUserProfile,
  getUserByAccessToken,
} from "../../../utils/supabase";

import {
  maxNumberOfUnredeemedSubscriptionsPerCoach,
  updateNumberOfSubscriptions,
} from "../../../utils/subscription-utils";

export default async function handler(req, res) {
  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to Create Subscription",
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

  if (!profile.can_coach) {
    return sendError({
      message: "you haven't set up your Stripe Account yet",
    });
  }

  const { count: number_of_unredeemed_subscriptions } = await supabase
    .from("subscription")
    .select("*", { count: "exact", head: true })
    .match({ coach: profile.id, redeemed: false });
  console.log(
    "number_of_unredeemed_subscriptions",
    number_of_unredeemed_subscriptions
  );

  if (
    number_of_unredeemed_subscriptions >=
    maxNumberOfUnredeemedSubscriptionsPerCoach
  ) {
    return sendError({
      message:
        "You've exceeded the number of unredeemed subscriptions. You must wait for any existing ones to be redeemed or delete one to create a new one.",
    });
  }

  console.log("user", user);
  console.log("profile", profile);

  if (!("subscriptionPrice" in req.body)) {
    return sendError({
      message: 'missing "subscriptionPrice" parameter',
    });
  }

  let { subscriptionPrice } = req.body;
  if (isNaN(subscriptionPrice)) {
    return sendError({
      message: "invalid subscription price",
    });
  }

  subscriptionPrice = Math.floor(Number(subscriptionPrice));
  let priceObject;
  if (subscriptionPrice > 0) {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    priceObject = await stripe.prices.create({
      unit_amount: subscriptionPrice * 100,
      currency: "usd",
      recurring: { interval: "month" },
      product: profile.product_id,
    });
  }

  console.log("priceObject", priceObject);

  const { data: subscriptions, error: insertSubscriptionError } = await supabase
    .from("subscription")
    .insert([
      {
        coach: profile.id,
        coach_email: profile.email,
        price: subscriptionPrice,
        price_id: priceObject?.id || profile.default_price_id,
      },
    ]);

  if (insertSubscriptionError) {
    return sendError({
      message: insertSubscriptionError.message,
    });
  }

  const [subscription] = subscriptions;
  console.log("subscription", subscription);

  if (!subscription) {
    return sendError({
      message: "no subscription was created",
    });
  }

  await updateNumberOfSubscriptions(profile, supabase);

  res.status(200).json({
    status: {
      type: "succeeded",
      title: "Successfully Created Subscription",
    },
    subscription: subscription.id,
  });
}

export const maxNumberOfUnredeemedSubscriptionsPerCoach = 5;

export function truncateDollars(value, roundUp = true) {
  value = Number(value);
  value *= 100;
  value = roundUp ? Math.ceil(value) : Math.floor(value);
  value /= 100;
  return value;
}

export function dollarsToCents(dollars) {
  return Math.round(dollars * 100);
}

export const repsetterFeePercentage = 5;

const defaultLocale = "en-us";

export function formatDollars(dollars, useDecimals = true) {
  return dollars.toLocaleString(defaultLocale, {
    minimumFractionDigits: useDecimals ? 2 : 0,
    maximumFractionDigits: useDecimals ? 2 : 0,
    style: "currency",
    currency: "USD",
  });
}

export async function updateNumberOfUnredeemedSubscriptions(
  coachProfile,
  supabase
) {
  const { count: new_number_of_unredeemed_subscriptions } = await supabase
    .from("subscription")
    .select("*", { count: "exact", head: true })
    .match({ coach: coachProfile.id, redeemed: false });
  console.log(
    "new_number_of_unredeemed_subscriptions",
    new_number_of_unredeemed_subscriptions
  );

  const updateProfileResult = await supabase
    .from("profile")
    .update({
      number_of_unredeemed_subscriptions:
        new_number_of_unredeemed_subscriptions,
    })
    .eq("id", coachProfile.id);
  console.log(updateProfileResult);
}

export async function deleteClientSubscriptions(client, supabase) {}
export async function deleteCoachingSubscriptions(coach, supabase) {}
export async function deleteSubscription(subscriptionId, supabase) {}

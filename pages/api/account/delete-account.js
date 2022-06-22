/* eslint-disable consistent-return */
import {
  getSupabaseService,
  getUserProfile,
  isUserAdmin,
  getUserByAccessToken,
} from "../../../utils/supabase";
import Stripe from "stripe";

export default async function handler(req, res) {
  const supabase = getSupabaseService();
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to delete User",
        ...error,
      },
    });

  const { user } = await getUserByAccessToken(supabase, req);
  if (!user) {
    return sendError({ message: "you are not signed in" });
  }

  let userToDelete;
  if (req.query.userId) {
    if (isUserAdmin(user)) {
      const { userId } = req.query;
      if (userId) {
        const { data: foundUser, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error(error);
          return sendError({ message: "unable to find user" });
        }
        if (foundUser) {
          userToDelete = foundUser;
        }
      } else {
        return sendError({ message: "userId no defined" });
      }
    } else {
      return sendError({ message: "you are not authorized to delete users" });
    }
  } else {
    userToDelete = user;
  }

  console.log("userToDelete", userToDelete);
  if (!userToDelete) {
    return sendError({ message: "no user found" });
  }

  const profile = await getUserProfile(userToDelete, supabase);

  const { data: coachingSubscriptions } = await supabase
    .from("subscription")
    .select("*, client(*)")
    .match({ coach: profile.id });
  await Promise.all(
    coachingSubscriptions.map(async (coachingSubscription) => {
      const { client } = coachingSubscription;
      const coaches = client.coaches || [];
      if (coaches.includes(profile.id)) {
        coaches.splice(coaches.indexOf(profile.id), 1);
        console.log("updated coaches", coaches, "for client", client);
        const updateClientResponse = await supabase
          .from("profile")
          .update({ coaches })
          .eq("id", client.id);
        console.log("updateClientResponse", updateClientResponse);
      }
      if (coachingSubscription.stripe_id) {
        const cancelledStripeSubscription = await stripe.subscriptions.del(
          coachingSubscription.stripe_id
        );
        console.log("cancelledStripeSubscription", cancelledStripeSubscription);
      }
    })
  );
  const deleteCoachingSubscriptionsResult = await supabase
    .from("subscription")
    .delete()
    .eq("coach", profile.id);
  console.log(
    "deleteCoachingSubscriptionsResult",
    deleteCoachingSubscriptionsResult
  );

  const { data: clientSubscriptions } = await supabase
    .from("subscription")
    .select("*")
    .match({ client: profile.id });
  await Promise.all(
    clientSubscriptions.map(async (clientSubscription) => {
      if (clientSubscription.stripe_id) {
        const cancelledStripeSubscription = await stripe.subscriptions.del(
          clientSubscription.stripe_id
        );
        console.log("cancelledStripeSubscription", cancelledStripeSubscription);
      }
    })
  );
  const deleteClientSubscriptionsResult = await supabase
    .from("subscription")
    .delete()
    .eq("client", profile.id);
  console.log(
    "deleteClientSubscriptionsResult",
    deleteClientSubscriptionsResult
  );

  // FILL - delete workouts
  // FILL - delete diet
  // FILL - delete weight
  // FILL - delete pictures

  // delete stripe customer/account
  try {
    await stripe.customers.del(profile.stripe_customer);
  } catch (error) {
    console.error("error deleting stripe customer", error);
  }
  try {
    await stripe.accounts.del(profile.stripe_account);
  } catch (error) {
    console.error("error deleting stripe account", error);
  }

  const deleteProfileResult = await supabase
    .from("profile")
    .delete()
    .eq("id", userToDelete.id);
  console.log("delete profile result", deleteProfileResult);

  const { error: deleteUserError } = await supabase.auth.api.deleteUser(
    userToDelete.id
  );
  console.log("delete user result", deleteUserError);

  res.status(200).json({
    status: {
      type: "succeeded",
      title: "Deleted Account",
      message: `Successfully deleted ${userToDelete.email}`,
    },
  });
}

/* eslint-disable consistent-return */
import {
  getSupabaseService,
  getUserProfile,
  isUserAdmin,
  getUserByAccessToken,
  paginationSize,
  storagePaginationSize,
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
  console.log("profileToDelete", profile);
  const { data: coachingSubscriptions } = await supabase
    .from("subscription")
    .select("*, client(*)")
    .match({ coach: profile.id });
  await Promise.all(
    coachingSubscriptions.map(async (coachingSubscription) => {
      const { client } = coachingSubscription;
      const coaches = client?.coaches || [];
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

  const { error: deleteExercisesError } = await supabase
    .from("exercise")
    .delete()
    .match({ client: profile.id });
  console.log("deleteExercisesError", deleteExercisesError);

  const { error: deleteWeightError } = await supabase
    .from("weight")
    .delete()
    .match({ client: profile.id });
  console.log("deleteWeightError", deleteWeightError);

  const { data: picturesList, error: listPicturesError } =
    await supabase.storage.from("picture").list(`${profile.id}`);
  if (listPicturesError) {
    console.error(listPicturesError);
  } else {
    console.log("picturesList", picturesList);
  }
  const picturesToRemove = picturesList.map(
    (picture) => `${profile.id}/${picture.name}`
  );
  const { data: removedPictures, error: removePicturesError } =
    await supabase.storage.from("picture").remove(picturesToRemove);
  if (removePicturesError) {
    console.error(removePicturesError);
  }

  const { data: coachPicturesList, error: listCoachPicturesError } =
    await supabase.storage.from("coach-picture").list(`${profile.id}`);
  if (listCoachPicturesError) {
    console.error(listCoachPicturesError);
  } else {
    console.log("coachPicturesList", coachPicturesList);
  }
  const coachPicturesToRemove = picturesList.map(
    (picture) => `${profile.id}/${picture.name}`
  );
  const { data: removedCoachPictures, error: removeCoachPicturesError } =
    await supabase.storage.from("coach-picture").remove(coachPicturesToRemove);
  if (removeCoachPicturesError) {
    console.error(removeCoachPicturesError);
  }

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

import Stripe from "stripe";
import {
  getSupabaseService,
  getUserByAccessToken,
  getUserProfile,
  isUserAdmin,
} from "../../../utils/supabase";

// eslint-disable-next-line consistent-return
export default async function handler(req, res) {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = getSupabaseService();

  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to check user's stripe info",
        ...error,
      },
    });

  const { user } = await getUserByAccessToken(supabase, req);
  if (!user) {
    return sendError({ message: "you are not signed in" });
  }

  let userToCheck;
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
          userToCheck = foundUser;
        }
      } else {
        return sendError({ message: "userId no defined" });
      }
    } else {
      return sendError({ message: "you are not authorized to check users" });
    }
  } else {
    userToCheck = user;
  }

  console.log("userToCheck", userToCheck);
  if (!userToCheck) {
    return sendError({ message: "no user found" });
  }

  const profile = await getUserProfile(userToCheck, supabase);
  console.log("profileToCheck", profile);

  const updatedProfile = {};

  if (!profile.stripe_customer) {
    console.log("creating stripe_customer");
    const customer = await stripe.customers.create({
      email: profile.email,
    });
    console.log("customer", customer);
    updatedProfile.stripe_customer = customer.id;
  }

  if (!profile.stripe_account) {
    console.log("creating stripe_account");
    const account = await stripe.accounts.create({
      email: profile.email,
      type: "express",
    });
    console.log("account", account);
    updatedProfile.stripe_account = account.id;
  }

  if (Object.keys(updatedProfile).length > 0) {
    await supabase.from("profile").update(updatedProfile).eq("id", profile.id);
  }

  res.status(200).json({
    message: "stripe customer updated",
    data: updatedProfile,
  });
}

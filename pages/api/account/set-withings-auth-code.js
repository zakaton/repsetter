/* eslint-disable consistent-return */
import {
  getSupabaseService,
  getUserProfile,
  getUserByAccessToken,
} from "../../../utils/supabase";

export default async function handler(req, res) {
  const supabase = getSupabaseService();
  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to update Withings auth code",
        ...error,
      },
    });

  const { user } = await getUserByAccessToken(supabase, req);
  if (!user) {
    return sendError({ message: "you are not signed in" });
  }

  const profile = await getUserProfile(user, supabase);
  if (!profile) {
    return sendError({ message: "user profile not found" });
  }

  let authCode = req.query.code || null;
  if (authCode == "null") {
    authCode = null;
  }
  await supabase
    .from("profile")
    .update({ withings_auth_code: authCode })
    .eq("id", profile.id);

  res.status(200).json({
    status: {
      type: "succeeded",
      title: "successfully updated Withings auth code",
    },
    withings_auth_code: authCode,
  });
}

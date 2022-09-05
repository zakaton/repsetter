/* eslint-disable consistent-return */
import {
  getSupabaseService,
  getUserProfile,
  getUserByAccessToken,
} from "../../../utils/supabase";
import { getWithingsAccessToken } from "../../../utils/withings";

export default async function handler(req, res) {
  const supabase = getSupabaseService();
  const sendError = (error) =>
    res.status(200).json({
      status: {
        type: "failed",
        title: "Failed to get Withings access token",
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
  if (!profile.withings_auth_code) {
    return sendError({ message: "no withings authorization code found" });
  }

  const json = await getWithingsAccessToken(profile.withings_auth_code);
  if (json.status != 0) {
    return sendError({ message: json.error });
  }
  const { access_token, refresh_token, expires_in } = json.body;
  await supabase
    .from("profile")
    .update({
      withings_access_token: access_token,
      withings_refresh_token: refresh_token,
      withings_token_expiration: expires_in,
    })
    .eq("id", profile.id);

  res.status(200).json({
    status: {
      type: "succeeded",
      title: "Successfully Received Withings access token",
    },
    json,
  });
}

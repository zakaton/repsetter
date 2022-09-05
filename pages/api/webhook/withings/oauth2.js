/* eslint-disable camelcase */
import { getSupabaseService } from "../../../../utils/supabase";
import { getNonce } from "../../../../utils/withings";

export default async function handler(req, res) {
  const supabase = getSupabaseService();

  res.status(200).json({ hello: "world" });
}

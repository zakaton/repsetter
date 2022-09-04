/* eslint-disable camelcase */
import { getSupabaseService } from "../../../../utils/supabase";

export default async function handler(req, res) {
  const supabase = getSupabaseService();

  res.status(200).json({ hello: "world" });
}

import { createClient } from "@supabase/supabase-js";
import cookie from "cookie";

export const paginationSize = 1_000;
export const storagePaginationSize = 100;

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabaseAuthHeader = "x-supabase-auth";
export const getUserByAccessToken = async (supabase, req) => {
  const accessToken = req.headers[supabaseAuthHeader];
  return supabase.auth.api.getUser(accessToken);
};

export const isUserAdmin = (user) => user.email?.endsWith("@ukaton.com");

export const getSupabaseService = (req) => {
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  if (req) {
    const token = cookie.parse(req.headers.cookie)["sb-access-token"];
    supabaseService.auth.session = () => ({
      access_token: token,
    });
  }
  return supabaseService;
};

export async function getUserProfile(user, _supabase = supabase) {
  const { data: profile } = await _supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();
  return profile;
}

export const dateFromDateAndTime = (date, time) => {
  const fullDate = new Date();

  const [year, month, day] = date.split("-");
  fullDate.setUTCFullYear(year);
  fullDate.setMonth(month - 1);
  fullDate.setDate(day);

  if (time) {
    const [hours, minutes] = time.split(":");
    fullDate.setHours(hours);
    fullDate.setMinutes(minutes);
  } else {
    fullDate.setHours(0);
    fullDate.setMinutes(0);
  }

  return fullDate;
};

export const generateUrlSuffix = (object) => {
  return object ? `?t=${new Date(object.updated_at).getTime()}` : "";
};

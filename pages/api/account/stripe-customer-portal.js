/* eslint-disable consistent-return */
import Stripe from 'stripe';
import absoluteUrl from 'next-absolute-url';
import { getSupabaseService, getUserProfile } from '../../../utils/supabase';

export default async function handler(req, res) {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = getSupabaseService();
  const { user } = await supabase.auth.api.getUser(req.query.access_token);
  if (!user) {
    return res.redirect('/account');
  }

  const { origin } = absoluteUrl(req);

  const profile = await getUserProfile(user, supabase);
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer,
    return_url: origin + process.env.STRIPE_CUSTOMER_PORTAL_RETURN_URL,
  });

  console.log("session", session)

  if (session) {
    res.redirect(session.url);
  } else {
    res.redirect('/account');
  }
}

import { useEffect, useState, createContext, useContext } from 'react';
import {
  supabase,
  getUserProfile,
  supabaseAuthHeader,
  isUserAdmin,
} from '../utils/supabase';
export const UserContext = createContext();

export function UserContextProvider(props) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(supabase.auth.user());
  const [isLoading, setIsLoading] = useState(true);
  const [didDeleteAccount, setDidDeleteAccount] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [baseFetchHeaders, setBaseFetchHeaders] = useState({});
  const [stripeLinks, setStripeLinks] = useState({});

  useEffect(() => {
    if (session?.access_token) {
      setBaseFetchHeaders({ [supabaseAuthHeader]: session.access_token });
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token) {
      setStripeLinks({
        onboarding: `/api/account/stripe-onboarding?access_token=${session.access_token}`,
        dashboard: `/api/account/stripe-dashboard?access_token=${session.access_token}`,
      });
    }
  }, [session]);

  const fetchWithAccessToken = (url, options) =>
    fetch(url, {
      ...(options || {}),
      headers: { ...(options?.headers || {}), ...baseFetchHeaders },
    });

  const updateUserProfile = async () => {
    const user = supabase.auth.user();
    if (user) {
      const profile = await getUserProfile(user);
      setUser({
        ...user,
        ...profile,
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    const session = supabase.auth.session();
    setSession(session);
    
    updateUserProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(event, session);

        setSession(session);
        switch (event) {
          case 'SIGNED_IN':
            await updateUserProfile();
            break;
          case 'SIGNED_OUT':
            setUser(null);
            break;
          case 'TOKEN_REFRESHED':
            await updateUserProfile();
            break;
          case 'USER_UPDATED':
            break;
          case 'USER_DELETED':
            setUser(null);
            break;
          default:
            console.log(`uncaught event "${event}"`);
            break;
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (user) {
      console.log('subscribing to user updates');
      const subscription = supabase
        .from(`profile:id=eq.${user.id}`)
        .on('UPDATE', (payload) => {
          console.log('updated profile');
          setUser({ ...user, ...payload.new });
        })
        .on('DELETE', () => {
          console.log('deleted account');
          signOut();
        })
        .subscribe();
      return () => {
        console.log('unsubscribing to user updates');
        supabase.removeSubscription(subscription);
      };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setIsAdmin(isUserAdmin(user));
    }
  }, [user]);

  const deleteAccount = async () => {
    await fetchWithAccessToken('/api/account/delete-account');
    signOut();
    setDidDeleteAccount(true);
  };

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    user,
    session,
    signOut,
    deleteAccount,
    isLoading,
    didDeleteAccount,

    fetchWithAccessToken,
    stripeLinks,

    isAdmin,
  };

  return <UserContext.Provider value={value} {...props} />;
}

export function useUser() {
  const context = useContext(UserContext);
  return context;
}

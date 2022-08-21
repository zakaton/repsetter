import { useEffect, useState, createContext, useContext } from "react";
import { useUser } from "./user-context";
import { isUserAdmin, supabase } from "../utils/supabase";
import { useRouter } from "next/router";

export const ClientContext = createContext();

const pathnamesForQuery = [
  "diary",
  "exercise-types",
  "progress",
  "pictures",
  "exercises",
  "all-users",
  "bodyweight",
].map((pathname) => "/dashboard/" + pathname);

export function ClientContextProvider(props) {
  const { user, isLoading, isAdmin } = useUser();

  const [clients, setClients] = useState();
  const [selectedClient, setSelectedClient] = useState();
  const [selectedDate, setSelectedDate] = useState();

  const [isGettingClients, setIsGettingClients] = useState(false);
  const getClients = async (refresh) => {
    if (!clients || refresh) {
      setIsGettingClients(true);
      const { data: clients } = await supabase
        .from("subscription")
        .select("*")
        .match({ coach: user.id, redeemed: true });
      console.log("fetched clients", clients);
      setClients(clients);
      setIsGettingClients(false);
    }
  };

  const getSelectedDate = () => {
    if ("date" in router.query) {
      const selectedDateString = router.query.date;
      const selectedDate = new Date(selectedDateString);
      console.log("query selected date", selectedDate);
      setSelectedDate(selectedDate);
    } else {
      setSelectedDate(new Date());
    }
  };

  useEffect(() => {
    if (clients) {
      console.log(`subscribing to subscription updates`);
      const subscription = supabase
        .from(`subscription`)
        .on("INSERT", (payload) => {
          console.log(`new subscription`, payload);
          getClients(true);
        })
        .on("UPDATE", (payload) => {
          console.log(`updated subscription`, payload);
          getClients(true);
        })
        .on("DELETE", (payload) => {
          console.log(`deleted subscription`, payload);
          const deletedClient = payload.old;
          // eslint-disable-next-line no-shadow
          setClients(
            clients.filter((client) => client?.id !== deletedClient.id)
          );
        })
        .subscribe();
      return () => {
        console.log(`unsubscribing to subscription updates`);
        supabase.removeSubscription(subscription);
      };
    }
  }, [clients]);

  const router = useRouter();

  const [overrideInitialClientEmail, setOverrideInitialClientEmail] =
    useState(false);
  const [initialClientEmail, setInitialClientEmail] = useState();
  const getUserProfile = async () => {
    console.log("getUserProfile", initialClientEmail);
    const { data: profile, error } = await supabase
      .from("profile")
      .select("*")
      .eq("email", initialClientEmail)
      .maybeSingle();
    if (error) {
      console.error(error);
    } else {
      console.log("getUserProfileResult", profile);
      if (profile) {
        const newClient = {
          client_email: profile.email,
          client: profile.id,
        };
        const newClients = [...(clients?.length > 0 ? clients : []), newClient];
        setClients(newClients);
        setSelectedClient(newClient);
      } else {
        setSelectedClient();
      }
    }
    setCheckedQuery(true);
  };
  useEffect(() => {
    if (initialClientEmail && overrideInitialClientEmail) {
      getUserProfile();
      setOverrideInitialClientEmail(false);
    }
  }, [initialClientEmail, overrideInitialClientEmail]);

  const [checkedQuery, setCheckedQuery] = useState(false);
  useEffect(() => {
    if (router.isReady) {
      console.log("CHECK QUERY", router.query);
      if ("client" in router.query) {
        setInitialClientEmail(router.query.client);
      } else {
        setCheckedQuery(true);
      }
    }
  }, [router.isReady]);

  useEffect(() => {
    if (clients && initialClientEmail && !checkedQuery) {
      const selectedClient = clients.find(
        (client) => client.client_email === initialClientEmail
      );
      if (selectedClient) {
        console.log("initialClient", selectedClient, initialClientEmail);
        setSelectedClient(selectedClient);
        setCheckedQuery(true);
      } else if (isAdmin) {
        console.log("getting user outside of clients", initialClientEmail);
        getUserProfile();
      } else {
        setCheckedQuery(true);
      }
    }
  }, [clients, initialClientEmail, checkedQuery]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!pathnamesForQuery.includes(router.pathname)) {
      return;
    }

    const query = {};
    if (selectedClient) {
      console.log("selected client!", selectedClient);
      query["client"] = selectedClient.client_email;
    } else {
      delete router.query.client;
    }
    if (selectedDate) {
      query["date"] = selectedDate.toDateString();
    }

    console.log("final client query", query);
    router.replace({ query: { ...router.query, ...query } }, undefined, {
      shallow: true,
    });
  }, [router.isReady, selectedClient, selectedDate, router.pathname]);

  const [amITheClient, setAmITheClient] = useState(false);
  useEffect(() => {
    if (checkedQuery) {
      setAmITheClient(!selectedClient);
    }
  }, [selectedClient, checkedQuery]);

  const [selectedClientId, setSelectedClientId] = useState();
  useEffect(() => {
    console.log("LOL", selectedClient, user, isLoading, checkedQuery);
    if (!isLoading && user && checkedQuery) {
      setSelectedClientId(selectedClient ? selectedClient.client : user.id);
    }
  }, [selectedClient, user, isLoading, checkedQuery]);

  const [isSelectedDateToday, setIsSelectedDateToday] = useState(false);
  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const currentDate = new Date();
    const isSelectedDateToday =
      selectedDate.getFullYear() === currentDate.getFullYear() &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getDate() === currentDate.getDate();
    setIsSelectedDateToday(isSelectedDateToday);
  }, [selectedDate]);

  const [isSelectedDateAfterToday, setIsSelectedDateAfterToday] =
    useState(false);
  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const currentDate = new Date();
    setIsSelectedDateAfterToday(selectedDate.getTime() > currentDate.getTime());
  }, [selectedDate]);

  const value = {
    getClients,
    isGettingClients,
    clients,

    selectedClient,
    setSelectedClient,
    amITheClient,
    selectedClientId,

    selectedDate,
    setSelectedDate,
    getSelectedDate,
    isSelectedDateToday,
    isSelectedDateAfterToday,

    setInitialClientEmail,
    setOverrideInitialClientEmail,
  };

  return <ClientContext.Provider value={value} {...props} />;
}

export function useClient() {
  const context = useContext(ClientContext);
  return context;
}

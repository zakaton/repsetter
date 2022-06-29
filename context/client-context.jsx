import { useEffect, useState, createContext, useContext } from "react";
import { useUser } from "./user-context";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/router";

export const ClientContext = createContext();

const pathnamesForQuery = ["workouts", "pictures", "diet", "weight"].map(
  (pathname) => "/account/" + pathname
);

export function ClientContextProvider(props) {
  const { user, isLoading } = useUser();

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
        .match({ coach: user.id });
      console.log("fetched clients", clients);
      setClients(clients);
      setIsGettingClients(false);
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

  useEffect(() => {
    if (clients && "client" in router.query) {
      const selectedClientEmail = router.query.client;
      const selectedClient = clients.find(
        (client) => client.client_email === selectedClientEmail
      );
      if (selectedClient) {
        setSelectedClient(selectedClient);
      }
    }
  }, [clients]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    console.log("CHECK QUERY", router.query);
    if ("date" in router.query) {
      const selectedDateString = router.query.date;
      const selectedDate = new Date(selectedDateString);
      console.log("query selected date", selectedDate);
      setSelectedDate(selectedDate);
    } else {
      setSelectedDate(new Date());
    }
  }, [router.isReady]);

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
    setAmITheClient(!selectedClient);
  }, [selectedClient]);

  const [selectedClientId, setSelectedClientId] = useState();
  useEffect(() => {
    if (!isLoading) {
      setSelectedClientId(selectedClient ? selectedClient.client : user.id);
    }
  }, [selectedClient, user, isLoading]);

  const [isSelectedDateToday, setIsSelectedDateToday] = useState(false);
  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const currentDate = new Date();
    const isSelectedDateToday =
      selectedDate.getUTCFullYear() === currentDate.getUTCFullYear() &&
      selectedDate.getUTCMonth() === currentDate.getUTCMonth() &&
      selectedDate.getUTCDate() === currentDate.getUTCDate();
    setIsSelectedDateToday(isSelectedDateToday);
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
    isSelectedDateToday,
  };

  return <ClientContext.Provider value={value} {...props} />;
}

export function useClient() {
  const context = useContext(ClientContext);
  return context;
}

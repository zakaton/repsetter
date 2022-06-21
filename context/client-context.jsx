import { useEffect, useState, createContext, useContext } from "react";
import { useUser } from "./user-context";
import { supabase } from "../utils/supabase";

export const ClientContext = createContext();

export function ClientContextProvider(props) {
  const { user, isLoading } = useUser();

  const [clients, setClients] = useState();
  const [selectedClient, setSelectedClient] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const value = {
    getClients,
    isGettingClients,
    clients,
    selectedClient,
    setSelectedClient,
    selectedDate,
    setSelectedDate,
  };

  // FILL - get client and date from query params
  useEffect(() => {
    if (!isLoading && user) {
      setSelectedClient(user);
    }
  }, [isLoading, user]);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  return <ClientContext.Provider value={value} {...props} />;
}

export function useClient() {
  const context = useContext(ClientContext);
  return context;
}

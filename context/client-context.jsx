import { useEffect, useState, createContext, useContext } from "react";
import { useUser } from "./user-context";
import { isUserAdmin, supabase } from "../utils/supabase";
import { useRouter } from "next/router";

export const ClientContext = createContext();

export const firstDayOfBlockTemplate = new Date("Sun Oct 01 2000 00:00:00");

const pathnamesForQuery = [
  "diary",
  "exercise-types",
  "progress",
  "pictures",
  "exercises",
  "all-users",
  "bodyweight",
  "blocks",
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

  const [checkedQuery, setCheckedQuery] = useState({
    block: false,
    client: false,
  });
  const [initialBlockId, setInitialBlockId] = useState();
  useEffect(() => {
    if (router.isReady) {
      console.log("CHECK QUERY", router.query);
      let newCheckedQuery = { ...checkedQuery };
      if ("block" in router.query) {
        setInitialBlockId(router.query.block);
      } else {
        newCheckedQuery.block = true;
      }

      if ("client" in router.query) {
        setInitialClientEmail(router.query.client);
      } else {
        newCheckedQuery.client = true;
      }

      if (newCheckedQuery.block || newCheckedQuery.client) {
        setCheckedQuery(newCheckedQuery);
      }
    }
  }, [router.isReady]);

  useEffect(() => {
    if (clients && initialClientEmail && !checkedQuery.client) {
      const selectedClient = clients.find(
        (client) => client.client_email === initialClientEmail
      );

      if (selectedClient) {
        console.log("initialClient", selectedClient, initialClientEmail);
        setSelectedClient(selectedClient);
        setCheckedQuery({ ...checkedQuery, client: true });
      } else if (isAdmin) {
        console.log("getting user outside of clients", initialClientEmail);
        getUserProfile();
      } else {
        setCheckedQuery({ ...checkedQuery, client: true });
      }
    }
  }, [clients, initialClientEmail, checkedQuery]);

  const [selectedBlock, setSelectedBlock] = useState();
  const [selectedBlockDate, setSelectedBlockDate] = useState();

  const getSelectedBlockDate = () => {
    if ("block-date" in router.query) {
      const daysSinceFirstDayOfBlockTemplate =
        Number(router.query["block-date"]) || 0;
      const selectedBlockDate = new Date(firstDayOfBlockTemplate);
      selectedBlockDate.setDate(
        firstDayOfBlockTemplate.getDate() + daysSinceFirstDayOfBlockTemplate
      );
      console.log("query selected block date", selectedBlockDate);
      setSelectedBlockDate(selectedBlockDate);
    } else {
      setSelectedBlockDate(new Date(firstDayOfBlockTemplate));
    }
  };

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
    if (selectedBlockDate) {
      query["block-date"] =
        (selectedBlockDate - firstDayOfBlockTemplate) / (1000 * 60 * 60 * 24);
    }

    if (selectedBlock) {
      query["block"] = selectedBlock.id;
    } else {
      delete router.query.block;
    }

    console.log("final client query", query);
    router.replace({ query: { ...router.query, ...query } }, undefined, {
      shallow: true,
    });
  }, [
    router.isReady,
    selectedClient,
    selectedDate,
    selectedBlock,
    selectedBlockDate,
    router.pathname,
  ]);

  const [amITheClient, setAmITheClient] = useState(false);
  useEffect(() => {
    if (checkedQuery.client) {
      setAmITheClient(!selectedClient);
    }
  }, [selectedClient, checkedQuery]);

  const [selectedClientId, setSelectedClientId] = useState();
  useEffect(() => {
    if (!isLoading && user && checkedQuery.client) {
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

  const [blocks, setBlocks] = useState();
  const [gotBlocksForClientId, setGotBlocksForClientId] = useState();
  const [isGettingBlocks, setIsGettingBlocks] = useState(false);
  const getBlocks = async (refresh) => {
    console.log(isGettingBlocks, blocks, refresh, selectedClientId);
    if (isGettingBlocks) {
      return;
    }
    if (blocks && !refresh) {
      return;
    }
    if (!selectedClientId) {
      return;
    }
    if (!isAdmin && selectedClientId !== user.id) {
      return;
    }
    setIsGettingBlocks(true);
    console.log("getting blocks...", selectedClientId);
    const { data: blocks, error: getBlocksError } = await supabase
      .from("block")
      .select("*")
      .eq("user", selectedClientId);
    console.log("blocks results", blocks);
    if (getBlocksError) {
      console.error(getBlocksError);
    } else {
      setBlocks(blocks);
    }
    setGotBlocksForClientId(selectedClientId);
    if (selectedBlock) {
      setSelectedBlock(blocks.find((block) => block.id === selectedBlock.id));
    }
    setIsGettingBlocks(false);
  };
  useEffect(() => {
    if (selectedClientId != gotBlocksForClientId) {
      setSelectedBlock();
      if (blocks) {
        getBlocks(true);
      } else {
        setBlocks();
      }
    }
  }, [selectedClientId]);

  useEffect(() => {
    if (blocks && initialBlockId && !checkedQuery.block) {
      const selectedBlock = blocks.find((block) => block.id === initialBlockId);
      if (selectedBlock) {
        console.log("initialBlock", selectedBlock, initialBlockId);
        setSelectedBlock(selectedBlock);
      }
      setCheckedQuery({ ...checkedQuery, block: true });
      setInitialBlockId();
    }
  }, [blocks, initialBlockId, checkedQuery]);

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

    blocks,
    isGettingBlocks,
    getBlocks,

    selectedBlock,
    setSelectedBlock,
    selectedBlockDate,
    getSelectedBlockDate,
    setSelectedBlockDate,

    checkedQuery,
  };

  return <ClientContext.Provider value={value} {...props} />;
}

export function useClient() {
  const context = useContext(ClientContext);
  return context;
}

/* This example requires Tailwind CSS v2.0+ */
import { useClient } from "../../context/client-context";
import { useUser } from "../../context/user-context";
import { useEffect } from "react";

export default function ClientsSelect() {
  const { user } = useUser();

  const { clients, getClients, selectedClient, setSelectedClient } =
    useClient();
  useEffect(() => {
    if (!clients) {
      getClients();
    }
  }, [clients]);

  return (
    clients?.length > 0 && (
      <div className="w-50 ml-3 inline-block">
        <select
          id="clientEmail"
          className="mt-1 w-full rounded-md border-gray-300 py-1 pl-2 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={selectedClient?.client_email || user.email}
          onInput={(e) => {
            setSelectedClient(
              e.target.value === user.email
                ? null
                : clients.find(
                    (client) => client.client_email === e.target.value
                  )
            );
          }}
        >
          <option value={user.email}>Me</option>
          {clients?.map((client) => (
            <option key={client.client_email} value={client.client_email}>
              {client.client_email}
            </option>
          ))}
        </select>
      </div>
    )
  );
}

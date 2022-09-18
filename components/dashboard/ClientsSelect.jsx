import { useClient } from "../../context/client-context";
import { useUser } from "../../context/user-context";
import { useEffect } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ClientsSelect({
  showBlocks = false,
  showClients = true,
  name,
  className,
}) {
  const { user, isAdmin } = useUser();

  const {
    clients,
    getClients,
    selectedClient,
    setSelectedClient,
    blocks,
    selectedClientId,
    selectedBlock,
    setSelectedBlock,
    getBlocks,
  } = useClient();
  useEffect(() => {
    if (!clients) {
      getClients();
    }
  }, [clients]);

  useEffect(() => {
    if (showBlocks && selectedClientId) {
      getBlocks();
    }
  }, [selectedClientId]);

  console.log();

  return (
    clients?.length > 0 && (
      <div className={classNames("w-50 ml-3 inline-block", className)}>
        <select
          name={name}
          className="mt-1 w-full rounded-md border-gray-300 py-1 pl-2 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={
            selectedBlock && showBlocks
              ? selectedBlock.id
              : selectedClient?.client_email || user.email
          }
          onInput={(e) => {
            const isBlock = e.target.selectedOptions[0].dataset.block;
            if (isBlock) {
              setSelectedBlock(
                blocks.find((block) => block.id === e.target.value)
              );
            } else {
              setSelectedBlock();
              setSelectedClient(
                e.target.value === user.email
                  ? null
                  : clients.find(
                      (client) => client.client_email === e.target.value
                    )
              );
            }
          }}
        >
          {showClients && (
            <>
              <option value={user.email}>Me</option>
              <optgroup label="My Clients">
                {clients?.map((client) => (
                  <option key={client.client_email} value={client.client_email}>
                    {client.client_email}
                  </option>
                ))}
              </optgroup>
            </>
          )}
          {showBlocks && blocks?.length > 0 && (
            <optgroup
              label={
                false &&
                isAdmin &&
                selectedClient &&
                selectedClient.id !== user.id
                  ? `${selectedClient?.client_email}'s Blocks`
                  : "My Blocks"
              }
            >
              {blocks?.map((block) => (
                <option key={block.id} value={block.id} data-block="true">
                  {block.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
    )
  );
}

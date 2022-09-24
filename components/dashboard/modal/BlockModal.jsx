/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { TemplateIcon } from "@heroicons/react/outline";
import {
  supabase,
  dateFromDateAndTime,
  dateToString,
} from "../../../utils/supabase";
import { useClient } from "../../../context/client-context";
import { useUser } from "../../../context/user-context";

export default function BlockModal(props) {
  const {
    open,
    setOpen,
    selectedResult: selectedBlock,
    setSelectedResult: setSelectedBlock,
    setResultStatus: setBlockStatus,
    setShowResultNotification: setShowBlockNotification,

    setCreateResultStatus: setCreateBlockStatus,
    setShowCreateResultNotification: setShowCreateBlockNotification,
  } = props;

  const { user } = useUser();

  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [didAddBlock, setDidAddBlock] = useState(false);

  const [isUpdatingBlock, setIsUpdatingBlock] = useState(false);
  const [didUpdateBlock, setDidUpdateBlock] = useState(false);

  const [blockName, setBlockName] = useState("");
  const maxBlockNameLength = 50;

  const [description, setDescription] = useState("");
  const maxDescriptionLength = 500;

  const [numberOfWeeks, setNumberOfWeeks] = useState(4);
  const [isNumberOfWeeksEmptyString, setIsNumberOfWeeksEmptyString] =
    useState(false);
  const maxNumberOfWeeks = 6;

  useEffect(() => {
    if (!open) {
      setDidAddBlock(false);
      setDidUpdateBlock(false);

      setIsAddingBlock(false);
      setIsUpdatingBlock(false);

      setBlockName("");
      setDescription("");
      setNumberOfWeeks(4);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedBlock) {
        setBlockName(selectedBlock.name);
        setDescription(selectedBlock.description);
        setNumberOfWeeks(selectedBlock.number_of_weeks);
      }
    }
  }, [open, selectedBlock]);

  return (
    <Modal
      {...props}
      title={selectedBlock ? "Update Block" : "Add Block"}
      message={`${selectedBlock ? "Update" : "Add"} a block of exercises`}
      Icon={TemplateIcon}
      Button={
        <button
          type="submit"
          form="blockForm"
          className="inline-flex h-fit w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {selectedBlock
            ? isUpdatingBlock
              ? "Updating Block..."
              : didUpdateBlock
              ? "Updated Block!"
              : "Update Block"
            : isAddingBlock
            ? "Adding Block..."
            : didAddBlock
            ? "Added Block!"
            : "Add Block"}
        </button>
      }
    >
      <form
        className="mt-2 space-y-4"
        id="blockForm"
        onSubmit={async (e) => {
          e.preventDefault();
          let status = {};
          if (selectedBlock) {
            setIsUpdatingBlock(true);
            const updateBlockData = {
              name: blockName,
              description,
              number_of_weeks: numberOfWeeks,
            };

            console.log("updateBlockData", updateBlockData);
            const { data: updatedBlock, error: updatedBlockError } =
              await supabase
                .from("block")
                .update(updateBlockData)
                .match({ id: selectedBlock.id });
            if (updatedBlockError) {
              console.error(updatedBlockError);
              status = {
                type: "failed",
                title: "Failed to Update Block",
                message: updatedBlockError.message,
              };
            } else {
              status = {
                type: "succeeded",
                title: "Successfully Updated Block",
              };
            }
            setDidUpdateBlock(true);
          } else {
            setIsAddingBlock(true);
            const addBlockData = {
              name: blockName,
              description,
              number_of_weeks: numberOfWeeks,

              user: user.id,
              user_email: user.email,
            };
            const { data: addedBlock, error: addBlockError } = await supabase
              .from("block")
              .insert([addBlockData]);
            if (addBlockError) {
              console.error(addBlockError);
              status = { type: "failed", message: addBlockError.message };
            } else {
              console.log("addedBlock", addedBlock);
              status = {
                type: "succeeded",
                message: "Successfully added Block",
              };
            }
            setDidAddBlock(true);

            setCreateBlockStatus?.(status);
            setShowCreateBlockNotification?.(true);
          }

          setBlockStatus?.(status);
          setShowBlockNotification?.(true);
          setOpen(false);
        }}
      >
        <div className="">
          <label
            htmlFor="blockName"
            className="block text-sm font-medium text-gray-700"
          >
            Block Name
          </label>
          <input
            required
            type="text"
            autoComplete="off"
            id="blockName"
            name="blockName"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Type a Block Name"
            value={blockName}
            maxLength={maxBlockNameLength}
            onInput={(e) => setBlockName(e.target.value)}
          />
          <p className="my-0 mt-1 p-0 text-sm italic text-gray-400">
            {blockName.length}/{maxBlockNameLength}
          </p>
        </div>

        <div className="">
          <label
            htmlFor="description"
            className="block select-none text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <div className="mt-1">
            <textarea
              placeholder="optional description"
              value={description}
              maxLength={maxDescriptionLength}
              onInput={(e) => {
                const newDescription = e.target.value;
                setDescription(newDescription.slice(0, maxDescriptionLength));
              }}
              name="description"
              id="description"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <p className="my-0 mt-1 p-0 text-sm italic text-gray-400">
              {description.length}/{maxDescriptionLength}
            </p>
          </div>
        </div>

        <div className="">
          <label
            htmlFor="numberOfWeeks"
            className="block select-none text-sm font-medium text-gray-700"
          >
            Number of Weeks
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              required
              type="number"
              inputMode="numeric"
              min="1"
              max={maxNumberOfWeeks}
              value={isNumberOfWeeksEmptyString ? "" : numberOfWeeks}
              onInput={(e) => {
                setIsNumberOfWeeksEmptyString(e.target.value === "");
                setNumberOfWeeks(Number(e.target.value));
              }}
              placeholder="4"
              name="numberOfWeeks"
              id="numberOfWeeks"
              className="hide-arrows block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <p className="my-0 mt-1 p-0 text-sm italic text-gray-400">
            Max {maxNumberOfWeeks} weeks
          </p>
        </div>
      </form>
    </Modal>
  );
}

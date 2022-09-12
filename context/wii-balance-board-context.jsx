import { useEffect, useState, createContext, useContext } from "react";
import WiiBalanceBoard from "../utils/wii-balance-board/WiiBalanceBoard";

export const WiiBalanceBoardContext = createContext();

export function WiiBalanceBoardContextProvider(props) {
  const [wiiBalanceBoard, setWiiBalanceBoard] = useState();

  const [canConnectToWiiBalanceBoard, setCanConnectToWiiBalanceBoard] =
    useState(false);
  useEffect(() => {
    setCanConnectToWiiBalanceBoard(navigator?.hid);
  }, []);

  const connectToWiiBalanceBoard = async () => {
    if (canConnectToWiiBalanceBoard && !wiiBalanceBoard) {
      try {
        const devices = await navigator.hid.requestDevice({
          filters: [{ vendorId: 0x057e }],
        });

        const device = devices[0];
        if (device) {
          const wiiBalanceBoard = new WiiBalanceBoard(device);
          wiiBalanceBoard.device.addEventListener(
            "inputreport",
            async () => {
              await wiiBalanceBoard.setLed(0, true);
            },
            { once: true }
          );
          window.wiiBalanceBoard = wiiBalanceBoard;
          wiiBalanceBoard._isAButtonDown = false;
          wiiBalanceBoard.BtnListener = (buttons) => {
            wiiBalanceBoardEventListeners.buttons?.forEach((callback) =>
              callback(buttons)
            );

            if (wiiBalanceBoard._isAButtonDown !== buttons.A) {
              wiiBalanceBoard._isAButtonDown = buttons.A;
              const eventType = buttons.A ? "buttondown" : "buttonup";
              console.log(eventType);
              wiiBalanceBoardEventListeners[eventType]?.forEach((callback) =>
                callback()
              );
            }
          };
          wiiBalanceBoard.WeightListener = (weights) => {
            //console.log("wiiBalanceBoard weights", weights);
            //const {BOTTOM_LEFT, BOTTOM_RIGHT, TOP_LEFT, TOP_RIGHT, total} = weights
            wiiBalanceBoardEventListeners.weights?.forEach((callback) =>
              callback(weights)
            );
          };
          console.log(`HID: ${wiiBalanceBoard.productName}`);
          setWiiBalanceBoard(wiiBalanceBoard);
        }
      } catch (error) {
        console.log("An error occurred.", error);
      }
    }
  };

  const [wiiBalanceBoardEventListeners, setWiiBalanceBoardEventListeners] =
    useState({ button: [], buttondown: [], buttonup: [], weights: [] });

  const addWiiBalanceBoardEventListener = (type, callback) => {
    if (
      type in wiiBalanceBoardEventListeners &&
      callback &&
      !wiiBalanceBoardEventListeners[type].includes(callback)
    ) {
      const newWiiBalanceBoardEventListeners = {
        ...wiiBalanceBoardEventListeners,
      };
      newWiiBalanceBoardEventListeners[type].push(callback);
      setWiiBalanceBoardEventListeners(newWiiBalanceBoardEventListeners);
    }
  };
  const removeWiiBalanceBoardEventListener = (type, callback) => {
    if (
      type in wiiBalanceBoardEventListeners &&
      callback &&
      wiiBalanceBoardEventListeners[type].includes(callback)
    ) {
      const newWiiBalanceBoardEventListeners = {
        ...wiiBalanceBoardEventListeners,
      };
      const index = wiiBalanceBoardEventListeners[type].indexOf(callback);
      newWiiBalanceBoardEventListeners[type].splice(index, 1);
      setWiiBalanceBoardEventListeners(newWiiBalanceBoardEventListeners);
    }
  };
  useEffect(() => {
    console.log(
      "wiiBalanceBoardEventListeners",
      wiiBalanceBoardEventListeners.weights
    );
  }, [wiiBalanceBoardEventListeners]);

  const openWiiBalanceBoardData = async () => {
    if (wiiBalanceBoard?.device && !wiiBalanceBoard.device.opened) {
      await wiiBalanceBoard?.device?.open();
      await wiiBalanceBoard?.setLed(0, true);
    }
  };
  const closeWiiBalanceBoardData = async () => {
    if (wiiBalanceBoard?.device?.opened) {
      await wiiBalanceBoard?.setLed(0, false);
      await wiiBalanceBoard?.device?.close();
    }
  };

  const value = {
    wiiBalanceBoard,
    canConnectToWiiBalanceBoard,
    addWiiBalanceBoardEventListener,
    removeWiiBalanceBoardEventListener,
    connectToWiiBalanceBoard,
    openWiiBalanceBoardData,
    closeWiiBalanceBoardData,
  };

  return <WiiBalanceBoardContext.Provider value={value} {...props} />;
}

export function useWiiBalanceBoard() {
  const context = useContext(WiiBalanceBoardContext);
  return context;
}

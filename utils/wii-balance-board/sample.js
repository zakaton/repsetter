import WiiBalanceBoard from "./WiiBalanceBoard.js";

let requestButton = document.getElementById("request-hid-device");

var wiiBalanceBoard = undefined;

function setButton(elementId, action) {
  document.getElementById(elementId).addEventListener("click", async () => {
    action();
  });
}

requestButton.addEventListener("click", async () => {
  let device;
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }],
    });

    device = devices[0];
    wiiBalanceBoard = new WiiBalanceBoard(device);
  } catch (error) {
    console.log("An error occurred.", error);
  }

  if (!device) {
    console.log("No device was selected.");
  } else {
    console.log(`HID: ${device.productName}`);

    enableControls();
    initCanvas();
  }
});

function initButtons() {
  // LED buttons
  document
    .getElementById("led1")
    .addEventListener("click", () => wiiBalanceBoard.toggleLed(0));
}

function initCanvas() {
  wiiBalanceBoard.BtnListener = (buttons) => {
    var buttonJSON = JSON.stringify(buttons, null, 2);

    if (document.getElementById("buttons").innerHTML != buttonJSON) {
      document.getElementById("buttons").innerHTML = buttonJSON;
    }
  };

  wiiBalanceBoard.WeightListener = (weights) => {
    var weightsJSON = JSON.stringify(
      weights,
      (key, value) => {
        return value.toFixed ? value.toFixed(1) : value;
      },
      2
    );

    window.dispatchEvent(new CustomEvent("weights", { detail: { weights } }));

    if (document.getElementById("weights").innerHTML != weightsJSON) {
      document.getElementById("weights").innerHTML = weightsJSON;
    }

    for (let position in weights) {
      const weight = weights[position];
      if (position !== "total")
        document.getElementById(position).style.opacity = weight / 40;
    }
  };
}

function enableControls() {
  document.getElementById("Controls").classList.remove("hidden");
  document.getElementById("WeightsViz").classList.remove("hidden");
  document.getElementById("instructions").classList.add("hidden");
}

initButtons();

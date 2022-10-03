import { EventDispatcher } from "./EventDispatcher";

export default class MiSmartScale2 extends EventDispatcher {
  serviceUUID = "0000181d-0000-1000-8000-00805f9b34fb";
  characteristicUUID = "00002a9d-0000-1000-8000-00805f9b34fb";

  get isConnected() {
    return this.server?.connected;
  }
  async connect() {
    if (!this.device) {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.serviceUUID] }],
      });
      if (device) {
        this.device = device;
        this.device.addEventListener("gattserverdisconnected", (event) => {
          this.dispatchEvent({ type: "disconnected" });
          this.device = null;
        });
        this.server = await this.device.gatt.connect();
        this.service = await this.server.getPrimaryService(this.serviceUUID);
        this.characteristic = await this.service.getCharacteristic(
          this.characteristicUUID
        );
        this.characteristic.addEventListener(
          "characteristicvaluechanged",
          this.onCharacteristicValueChanged.bind(this)
        );
        await this.characteristic.startNotifications();
        this.dispatchEvent({ type: "connected" });
      }
    } else {
      if (!this.isConnected) {
        await this.device.gatt.connect();
        this.dispatchEvent({ type: "connected" });
      }
    }
  }
  async disconnect() {
    if (this.device) {
      await this.device?.gatt?.disconnect();
      this.device = null;
    }
  }

  async open() {
    if (this.isConnected) {
      await this.characteristic?.startNotifications();
    }
  }
  async close() {
    if (this.isConnected) {
      await this.characteristic?.stopNotifications();
    }
  }

  onCharacteristicValueChanged(event) {
    const dataView = event.target.value;
    const controlByte = dataView.getUint8(0);
    const stabilized = Boolean(controlByte & (1 << 5));
    let weight = dataView.getUint16(1, true);
    let isUsingKilograms = true;
    if (Boolean(controlByte & (1 << 0))) {
      // lbs
      isUsingKilograms = false;
    } else if (Boolean(controlByte & (1 << 4))) {
      // jin
      isUsingKilograms = false;
      weight *= 1.1023113109244;
    }

    if (isUsingKilograms) {
      weight /= 200;
    } else {
      weight /= 100;
    }

    this.dispatchEvent({
      type: "weight",
      message: { weight, stabilized, isUsingKilograms },
    });
  }
}

// https://github.com/wiecosystem/Bluetooth/blob/master/doc/devices/huami.health.scale2.md
// https://dev.to/henrylim96/reading-xiaomi-mi-scale-data-with-web-bluetooth-scanning-api-1mb9

import { EventDispatcher } from "./EventDispatcher";
import Metrics from "./MIBCSMetrics";

export default class MiBodyCompositionScale extends EventDispatcher {
  serviceUUID = "0000181b-0000-1000-8000-00805f9b34fb";
  characteristicUUID = "00002a9c-0000-1000-8000-00805f9b34fb";

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
    const controlByte = dataView.getUint8(1);
    const stabilized = Boolean(controlByte & (1 << 5));
    let weight = dataView.getUint16(11, true);
    let isUsingKilograms = true;
    if (isUsingKilograms) {
      weight /= 200;
    } else {
      weight /= 100;
    }

    const impedance = dataView.getUint16(9, true);
    if (stabilized && impedance > 0 && impedance < 3000) {
      const metrics = new Metrics(weight, impedance, 180, 28, "male");
      const result = metrics.getResult();
      const bodyfatPercentage = result.find(
        (result) => result.name === "Fat"
      ).value;
      // not gonna use bodyfat percentage - complete garbage data
    }

    this.dispatchEvent({
      type: "weight",
      message: { weight, stabilized, isUsingKilograms },
    });
  }
}

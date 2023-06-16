"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_aedes = __toESM(require("aedes"));
var import_aedes_server_factory = require("aedes-server-factory");
class Tinymqttbroker extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "tinymqttbroker"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this.aedes = new import_aedes.default();
    this.aedes.id = "iobroker_mqtt_broker_" + Math.floor(Math.random() * 1e5 + 1e5);
    this.server = (0, import_aedes_server_factory.createServer)(this.aedes);
  }
  async onReady() {
    this.log.info("config option1: " + this.config.option1);
    this.log.info("config option2: " + this.config.option2);
    const port = this.config.option1;
    this.log.info(port + "aaaa");
    this.server.listen(port, () => {
      this.log.info("MQTT broker says: Server " + this.aedes.id + " started and listening on port " + port);
    });
    this.aedes.on("client", (client) => {
      this.log.info(`MQTT broker says: Client connected : MQTT Client ${client ? client.id : client} connected to aedes broker ${this.aedes.id}`);
    });
    this.aedes.on("clientDisconnect", (client) => {
      this.log.info(`MQTT broker says: Client disconnected : MQTT Client ${client ? client.id : client} disconnected from the aedes broker ${this.aedes.id}`);
    });
    await this.setObjectNotExistsAsync("testVariable", {
      type: "state",
      common: {
        name: "testVariable",
        type: "boolean",
        role: "indicator",
        read: true,
        write: true
      },
      native: {}
    });
    this.subscribeStates("testVariable");
    await this.setStateAsync("testVariable", true);
    await this.setStateAsync("testVariable", { val: true, ack: true });
    await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
    let result = await this.checkPasswordAsync("admin", "iobroker");
    this.log.info("check user admin pw iobroker: " + result);
    result = await this.checkGroupAsync("admin", "admin");
    this.log.info("check group user admin group admin: " + result);
  }
  onUnload(callback) {
    try {
      this.aedes.close();
      this.server.close();
      callback();
    } catch (e) {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Tinymqttbroker(options);
} else {
  (() => new Tinymqttbroker())();
}
//# sourceMappingURL=main.js.map

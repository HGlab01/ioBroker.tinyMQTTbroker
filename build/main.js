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
var import_portscanner = __toESM(require("portscanner"));
class Tinymqttbroker extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "tinymqttbroker"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    const serverPort = this.config.option1;
    console.log("Port " + serverPort + " is configured");
    import_portscanner.default.checkPortStatus(serverPort, "127.0.0.1", (error, status) => {
      console.log(`Portscanner result for port ${serverPort} is [${status}]`);
      this.log.debug(`Portscanner result for port ${serverPort} is [${status}]`);
      if (status == "open") {
        this.log.error(`Port ${serverPort} in use, please configure another port in adapter settings!`);
        this.terminate ? this.terminate(utils.EXIT_CODES.INVALID_CONFIG_OBJECT) : process.exit(0);
      } else {
        this.aedes = new import_aedes.default();
        this.aedes.id = "iobroker_mqtt_broker_" + Math.floor(Math.random() * 1e5 + 1e5);
        this.server = (0, import_aedes_server_factory.createServer)(this.aedes);
        this.server.listen(serverPort, () => {
          this.log.info("MQTT-broker says: Server " + this.aedes.id + " started and listening on port " + serverPort);
        });
        this.aedes.on("client", (client) => {
          this.log.info(`MQTT-broker says: Client ${client ? client.id : client} connected to broker ${this.aedes.id}`);
        });
        this.aedes.on("clientDisconnect", (client) => {
          this.log.info(`MQTT-broker says: Client ${client ? client.id : client} disconnected from the broker ${this.aedes.id}`);
        });
        this.aedes.on("subscribe", (subscriptions, client) => {
          this.log.debug(`MQTT-broker says: Client ${client ? client.id : client} subscribed to topic(s): ${subscriptions.map((s) => s.topic).join(",")} on broker ${this.aedes.id}`);
        });
        this.aedes.on("unsubscribe", (subscriptions, client) => {
          this.log.debug(`MQTT-broker says: Client ${client ? client.id : client} unsubscribed from topic(s): ${subscriptions.join(",")} on broker ${this.aedes.id}`);
        });
      }
    });
  }
  onUnload(callback) {
    try {
      this.aedes.close();
      this.server.close();
      this.log.info(`MQTT-broker says: I (${this.aedes.id}) stopped my service. See you soon!`);
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
  errorHandling(errorObject) {
    try {
      if (this.log.level != "debug" && this.log.level != "silly") {
        if (this.supportsFeature && this.supportsFeature("PLUGINS")) {
          const sentryInstance = this.getPluginInstance("sentry");
          if (sentryInstance) {
            sentryInstance.getSentryObject().captureException(errorObject);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  sendSentry(errorObject) {
    try {
      if (this.supportsFeature && this.supportsFeature("PLUGINS")) {
        const sentryInstance = this.getPluginInstance("sentry");
        if (sentryInstance) {
          sentryInstance.getSentryObject().captureException(errorObject);
        }
      }
    } catch (error) {
      this.log.error(`Error in function sendSentry(): ${error}`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Tinymqttbroker(options);
} else {
  (() => new Tinymqttbroker())();
}
//# sourceMappingURL=main.js.map

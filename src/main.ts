/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import Aedes from 'aedes';
import { createServer } from 'aedes-server-factory';

class Tinymqttbroker extends utils.Adapter {
	aedes!: Aedes;
	server!: any;
	withDB!: boolean;
	serverPort!: number;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'tinymqttbroker',
		});
		this.on('ready', this.onReady.bind(this));
		//this.on('stateChange', this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {

		this.serverPort = this.config.option1;
		this.withDB = this.config.option2;

		this.log.info('Start with DB: ' + this.withDB);

		if (this.withDB) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const NedbPersistence = require('aedes-persistence-nedb');
			const db = new NedbPersistence({ path: `${utils.getAbsoluteInstanceDataDir(this)}/mqttData`, prefix: '' });
			this.aedes = new Aedes({ persistence: db });
		}
		else {
			this.aedes = new Aedes();
		}

		this.aedes.id = 'iobroker_mqtt_broker_' + Math.floor(Math.random() * 100000 + 100000);
		this.server = createServer(this.aedes);

		this.server.listen(this.serverPort, () => {
			this.log.info('MQTT-broker says: Server ' + this.aedes.id + ' started and listening on port ' + this.serverPort);
		})
		// emitted when a client connects to the broker
		this.aedes.on('client', (client) => {
			this.log.info(`MQTT-broker says: Client ${(client ? client.id : client)} connected to broker ${this.aedes.id}`);
		})
		// emitted when a client disconnects from the broker
		this.aedes.on('clientDisconnect', (client) => {
			this.log.info(`MQTT-broker says: Client ${(client ? client.id : client)} disconnected from the broker ${this.aedes.id}`);
		})
		// emitted when a client subscribes to a message topic
		this.aedes.on('subscribe', (subscriptions, client) => {
			this.log.debug(`MQTT-broker says: Client ${(client ? client.id : client)} subscribed to topic(s): ${subscriptions.map(s => s.topic).join(',')} on broker ${this.aedes.id}`);
		})
		// emitted when a client unsubscribes from a message topic
		this.aedes.on('unsubscribe', (subscriptions, client) => {
			this.log.debug(`MQTT-broker says: Client ${(client ? client.id : client)} unsubscribed from topic(s): ${subscriptions.join(',')} on broker ${this.aedes.id}`);
		})
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			this.aedes.close();
			this.server.close();
			this.log.info(`MQTT-broker says: I (${this.aedes.id}) stopped my service. See you soon!`);
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Tinymqttbroker(options);
} else {
	// otherwise start the instance directly
	(() => new Tinymqttbroker())();
}
import { uid } from "@nesvet/n";
import { headers } from "./common";


export class RequestSender {
	constructor(ws) {
		if (ws.isWebSocketServer)
			ws.on("client-connect", RequestSender.handleClientConnect);
		else
			ws.sendRequest = RequestSender.send;
		
	}
	
	
	static send(...args) {
		
		const id = uid();
		const eventName = `message:${headers.response}-${id}`;
		
		if (typeof args.at(-1) == "function") {
			this.once(eventName, args.splice(-1, 1)[0]);
			this.sendMessage(headers.request, id, ...args);
		} else
			return new Promise((resolve, reject) => {
				
				this.once(eventName, (error, result) => {
					if (error) {
						const { message, ...restProps } = error;
						reject(Object.assign(new Error(message), restProps));
					} else
						resolve(result);
					
				});
				this.sendMessage(headers.request, id, ...args);
				
			});
	}
	
	
	static handleClientConnect(ws) {
		Object.assign(ws, {
			sendRequest: RequestSender.send
		});
		
	}
	
}

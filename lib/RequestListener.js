import { headers } from "./common";


export class RequestListener {
	constructor(ws) {
		ws.requestListener = this;
		
		ws.listenerHandlers.add(this.listenerHandler);
		
		if (ws.isWebSocketServer) {
			this.listenerHandlerRegExp = /^client-request:(.*)$/;
			ws.on(`client-message:${headers.request}`, (...args) => RequestListener.handle.call(...args));
		} else {
			this.listenerHandlerRegExp = /^request:(.*)$/;
			ws.on(`message:${headers.request}`, RequestListener.handle);
		}
		
	}
	
	listeners = new Map();
	
	listenerHandler = (add, eventName, listener) => {
		const kind = eventName.match(this.listenerHandlerRegExp)?.[1];
		if (kind) {
			if (add)
				this.listeners.set(kind, listener);
			else
				this.listeners.delete(kind);
			
			return true;
		}
	};
	
	
	static async handle(id, kind, ...rest) {
		const listener = (this.wss ?? this).requestListener.listeners.get(kind);
		
		let result;
		let error = null;
		
		if (listener)
			try {
				result =
					this.wss ?
						await listener.call(this.wss, this, ...rest) :
						await listener.apply(this, rest);
			} catch ({ message, ...restProps }) {
				error = { message, ...restProps };
			}
		else
			error = { message: `Unknown request kind "${kind}"` };
		
		this.sendMessage(`${headers.response}-${id}`, error, result);
		
	}
	
}

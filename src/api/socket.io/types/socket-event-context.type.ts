import type { Server, Socket } from "socket.io";
import type ExecutionContext from "../../../context/execution-context";
import type { AccessGrant } from "../../../security/access-grant";

export type SocketEventAck = (...args: unknown[]) => void;

export type SocketEventContext<TPayload = unknown> = {
	io: Server;
	socket: Socket;
	eventName: string;
	payload: TPayload;
	args: unknown[];
	ack?: SocketEventAck;
	access?: AccessGrant;
	context?: ExecutionContext;
};

import type IUser from "../../../contracts/user.contract";
import { Role } from "../../../enums/role.enum";
import { logger } from "../../../utils/logger.util";
import { userRoom } from "../common/user-room.common";
import {
	Gateway,
	On,
	OnConnect,
	UseSocket,
} from "../decorators/socket.decorator";
import { authMiddleware } from "../middlewares/auth.middleware";
import { contextMiddleware } from "../middlewares/context.middleware";
import type { SocketEventContext } from "../types/socket-event-context.type";
import { BaseGateway } from "./base.gateway";

type UserRoomPayload = Pick<IUser, "id">;

@Gateway()
export default class UserGateway extends BaseGateway {
	@OnConnect()
	@UseSocket(authMiddleware([Role.USER]), contextMiddleware())
	async connect(ctx: SocketEventContext): Promise<void> {
		const userId = ctx.context?.actor.id;
		if (!userId) {
			logger.warn(
				{ socket_id: ctx.socket.id },
				"[Socket.IO] authenticated actor id is invalid",
			);
			ctx.socket.disconnect(true);
			return;
		}
		const room = userRoom.self(userId);
		ctx.socket.join(room);
		logger.info(
			{ socket_id: ctx.socket.id, room, user_id: userId },
			"[Socket.IO] joined self room",
		);
	}

	@On("user.subscribe")
	@UseSocket(authMiddleware([Role.USER]), contextMiddleware())
	async subscribe(ctx: SocketEventContext<UserRoomPayload>): Promise<void> {
		await this.handleRoom(ctx, "join");
	}

	@On("user.unsubscribe")
	@UseSocket(authMiddleware([Role.USER]), contextMiddleware())
	async unsubscribe(ctx: SocketEventContext<UserRoomPayload>): Promise<void> {
		await this.handleRoom(ctx, "leave");
	}

	private async handleRoom(
		ctx: SocketEventContext<UserRoomPayload>,
		action: "join" | "leave",
	): Promise<void> {
		const subscriberId = ctx.context?.actor.id;
		const targetId = ctx.payload.id;
		if (!subscriberId || !targetId) {
			logger.warn(
				{
					socket_id: ctx.socket.id,
					subscriber_id: subscriberId,
					payload: ctx.payload,
				},
				`[Socket.IO] denied room ${action === "join" ? "subscription" : "unsubscription"}`,
			);
			return;
		}
		const room = userRoom.watch(targetId);
		ctx.socket[action === "join" ? "join" : "leave"](room);
		logger.info(
			{
				socket_id: ctx.socket.id,
				room,
				subscriber_id: subscriberId,
				target_id: targetId,
			},
			`[Socket.IO] ${action === "join" ? "joined" : "left"} watch room`,
		);
	}
}

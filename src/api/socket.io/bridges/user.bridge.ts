import { EVENTS } from "../../../events/constants/events.conts";
import { userRoom } from "../common/user-room.common";
import { BaseBridge } from "./base.bridge";

const WATCHABLE = new Set<(typeof EVENTS.USER)[keyof typeof EVENTS.USER]>([
	EVENTS.USER.READED,
	EVENTS.USER.CREATED,
	EVENTS.USER.DELETED,
	EVENTS.USER.PICTURE_DELETED,
	EVENTS.USER.PICTURE_UPDATED,
	EVENTS.USER.PROFILE_UPDATED,
	EVENTS.USER.STATUS_UPDATED,
	EVENTS.USER.USERNAME_UPDATED,
]);

export default class UserBridge extends BaseBridge {
	setup(): number {
		for (const event of Object.values(EVENTS.USER)) {
			this.listen(event, async (ev, ctx) => {
				this.publishToRoom(userRoom.self(ctx.actor.id), event, ev.payload);
				if (WATCHABLE.has(event))
					this.publishToRoom(userRoom.watch(ctx.actor.id), event, ev.payload);
			});
		}
		return this.counter;
	}
}

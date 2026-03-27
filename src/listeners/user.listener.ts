import { EVENTS } from "../events/constants/events.conts";
import { BaseListener } from "./base.listener";

export default class UserListener extends BaseListener {
	setup(): number {
		this.listen(EVENTS.USER.CREATED, async (_event, _context) => {
			//Logic here
		});

		return this.counter;
	}
}

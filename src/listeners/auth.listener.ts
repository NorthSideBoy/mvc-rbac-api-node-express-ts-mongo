import { EVENTS } from "../events/constants/events.conts";
import { BaseListener } from "./base.listener";

export default class AuthListener extends BaseListener {
	setup(): number {
		this.listen(EVENTS.AUTH.ACCOUNT_LOGGED_IN, async (_event, _context) => {
			//Logic here
		});

		return this.counter;
	}
}

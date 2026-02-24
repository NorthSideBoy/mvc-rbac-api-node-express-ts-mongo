import type ExecutionContext from "../src/context/execution-context";

export default abstract class Script {
	abstract readonly name: string;
	abstract readonly description: string;
	abstract get ctx(): ExecutionContext;
	public abstract run(): Promise<void>;
}

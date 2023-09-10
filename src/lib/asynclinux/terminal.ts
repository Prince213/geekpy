import type { ITerminal, TerminalHandler } from '$lib/jslinux';
import stripAnsi from 'strip-ansi';

type WaiterPredicate = (str: string) => boolean;
type WaiterResolve = (str: string | null) => void;
export type Waiter = {
	predicate: WaiterPredicate;
	resolve: WaiterResolve;
	promise: Promise<string | null>;
};

export default class AsyncTerminal implements ITerminal {
	private buffer = '';
	private cmd?: Waiter;
	private task?: Waiter;

	constructor(
		private readonly width: number,
		private readonly height: number,
		private readonly handler: TerminalHandler,
		private readonly maxHeight: number = 10000
	) {}

	public open(container: HTMLElement): void {
		void container;
	}

	public write(str: string): void {
		str = stripAnsi(str);
		if (this.task && this.task.predicate(str)) {
			const { resolve } = this.task;
			this.task = undefined;
			resolve(str);
		} else if (this.cmd && this.cmd.predicate(str)) {
			const { resolve } = this.cmd;
			this.cmd = undefined;
			resolve(this.buffer);
		}

		this.buffer += str;
		if (this.buffer.length > this.maxHeight * this.width) {
			this.buffer = this.buffer.slice(this.buffer.length - this.maxHeight * this.width);
		}
	}

	public async block(): Promise<void> {
		while (this.task) {
			await this.task.promise;
		}
	}

	public async watch(predicate: WaiterPredicate): Promise<string | null> {
		return new Promise((resolve) => {
			this.task = {
				predicate,
				resolve,
				promise: new Promise((resolve) => {
					if (this.task) {
						this.task.resolve = resolve;
					}
				})
			};
		});
	}

	public async park(): Promise<void> {
		while (this.cmd) {
			await this.cmd.promise;
		}
	}

	public async wait(predicate: WaiterPredicate): Promise<string | null> {
		this.buffer = '';
		return new Promise((resolve) => {
			this.cmd = {
				predicate,
				resolve,
				promise: new Promise((resolve) => {
					if (this.cmd) {
						this.cmd.resolve = resolve;
					}
				})
			};
		});
	}

	public abort(): void {
		if (this.cmd) {
			const { resolve } = this.cmd;
			this.cmd = undefined;
			resolve(null);
		}
	}

	public kill(): void {
		if (this.task) {
			const { resolve } = this.task;
			this.task = undefined;
			resolve(null);
		}
	}

	public getSize(): [number, number] {
		return [this.width, this.height];
	}
}

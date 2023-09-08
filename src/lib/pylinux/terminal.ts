import type { ITerminal, TerminalHandler } from '$lib/jslinux';
import stripAnsi from 'strip-ansi';

type WaiterPredicate = (str: string) => boolean;
type WaiterResolve = (str: string) => void;
export type Waiter = {
	predicate: WaiterPredicate;
	resolve: WaiterResolve;
	promise: Promise<string>;
};

export default class PyTerminal implements ITerminal {
	private buffer = '';
	private waiter?: Waiter;

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
		this.buffer += stripAnsi(str);
		if (this.buffer.length > this.maxHeight * this.width) {
			this.buffer = this.buffer.slice(this.buffer.length - this.maxHeight * this.width);
		}

		if (this.waiter) {
			const { predicate, resolve } = this.waiter;
			if (predicate(this.buffer)) {
				this.waiter = undefined;
				resolve(this.buffer);
			}
		}
	}

	public async wait(predicate: WaiterPredicate): Promise<string> {
		if (this.waiter) {
			await this.waiter.promise;
		}

		this.buffer = '';
		return new Promise((resolve) => {
			this.waiter = {
				predicate,
				resolve,
				promise: new Promise((resolve) => {
					if (this.waiter) {
						this.waiter.resolve = resolve;
					}
				})
			};
		});
	}

	public getSize(): [number, number] {
		return [this.width, this.height];
	}
}

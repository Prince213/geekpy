import type { ITerminal, TerminalHandler } from '$lib/jslinux';
import type { Waiter, WaiterPredicate } from '$lib/asynclinux/terminal';
import stripAnsi from 'strip-ansi';

class SizedBuffer<T> extends Array<T> {
	constructor(private readonly size: number, private readonly callback?: (item: T) => void) {
		super();
	}

	public push(...items: T[]): number {
		const length = super.push(...items);
		if (length > this.size) {
			this.callback?.(this.shift() as T);
		}
		return length;
	}
}

export default class PyTerminal implements ITerminal {
	private buffer = '';
	private cmd?: Waiter;
	private text?: string;

	public puts?: (str: string) => void;
	public forward?: boolean;
	private queue: SizedBuffer<string>;

	constructor(
		private readonly width: number,
		private readonly height: number,
		private readonly handler: TerminalHandler,
		private readonly maxHeight: number = 10000
	) {
		this.forward = false;
		this.queue = new SizedBuffer(1, (str) => {
			if (this.forward) this.puts?.(str);
		});
	}

	public open(container: HTMLElement): void {
		void container;
	}

	public write(str: string): void {
		str = stripAnsi(str);
		if (this.text && this.text.startsWith(str)) {
			this.text = this.text.slice(str.length);
			return;
		}

		this.buffer += str;
		if (this.cmd) {
			if (this.cmd.predicate(this.buffer)) {
				const { resolve } = this.cmd;
				this.cmd = undefined;
				this.queue.length = 0;
				resolve(this.buffer);
				return;
			} else {
				this.queue.forEach((str) => this.puts?.(str));
				this.queue.length = 0;
			}
		}

		if (str != '\r\n') {
			this.puts?.(str);
		} else {
			this.queue.push(str);
		}

		if (this.buffer.length > this.maxHeight * this.width) {
			this.buffer = this.buffer.slice(this.buffer.length - this.maxHeight * this.width);
		}
	}

	public async park(): Promise<void> {
		while (this.cmd) {
			await this.cmd.promise;
		}
	}

	public async wait(text: string, predicate: WaiterPredicate): Promise<string | null> {
		this.buffer = '';
		this.text = text;
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

	public getSize(): [number, number] {
		return [this.width, this.height];
	}
}

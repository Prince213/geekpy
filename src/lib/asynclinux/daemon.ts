type WaiterResolve = (...args: unknown[]) => void;
type Waiter = {
	resolve: WaiterResolve;
	promise: Promise<unknown>;
};

export default class AsyncDaemon {
	private interval?: ReturnType<typeof setInterval>;
	private waiter?: Waiter;
	private paused = false;

	constructor(callback: () => void, interval = 250) {
		this.interval = setInterval(async () => {
			if (this.paused) {
				return;
			}
			callback();
			if (this.waiter) {
				const { resolve } = this.waiter;
				this.waiter = undefined;
				resolve();
			}
		}, interval);
	}

	private async wait() {
		while (this.waiter) {
			await this.waiter.promise;
		}

		await new Promise((resolve) => {
			this.waiter = {
				resolve,
				promise: new Promise((resolve) => {
					if (this.waiter) {
						this.waiter.resolve = resolve;
					}
				})
			};
		});
	}

	public async pause() {
		await this.wait();
		this.paused = true;
	}

	public async resume() {
		if (!this.paused) return;

		if (this.waiter) {
			const { resolve } = this.waiter;
			this.waiter = undefined;
			resolve();
		}
		this.paused = false;
	}

	public cancel() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
			if (this.waiter) {
				const { resolve } = this.waiter;
				this.waiter = undefined;
				resolve();
			}
		}
	}
}

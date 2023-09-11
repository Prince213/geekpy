import PyTerminal from '$lib/pylinux/terminal';
import { ASCIIEOM, ASCIIEnter } from '$lib/asynclinux';
import { Linux } from '$lib/jslinux';

const BOOT_MAGIC = /\[(?:geekpy|root)@localhost .+\]\$ $/;
const CMD_MAGIC = /(?:\r\n)?\[(?:geekpy|root)@localhost .+\]\$ $/;

export default class PyLinux extends Linux(PyTerminal) {
	constructor(config: string, puts?: (str: string) => void) {
		super(config);
		this.terminal.puts = puts;
	}

	public cmd(text: string): void {
		this.puts(text + ASCIIEnter);
	}

	public async abort(): Promise<void> {
		this.cmd(ASCIIEOM);
		this.terminal.abort();
	}

	public async exec(text: string, forward = false): Promise<string | null> {
		await this.terminal.park();
		const promise = this.terminal.wait(`${text}\r\n`, (str) => CMD_MAGIC.test(str));
		this.terminal.forward = forward;
		this.cmd(text);
		let result = await promise;
		if (result === null) {
			return null;
		}

		result = result.replace(CMD_MAGIC, '');
		if (result.endsWith('\r\n')) {
			result = result.substring(0, result.length - 2);
		}
		return result;
	}

	public async calibrate(cmd = 'echo $?', expect = '0'): Promise<boolean> {
		const result = await this.exec(cmd);
		return result === expect;
	}

	public async boot(): Promise<this> {
		await this.terminal.park();
		const promise = this.terminal.wait('', (str) => BOOT_MAGIC.test(str));
		await super.boot();
		await promise;
		return this;
	}
}
export { PyTerminal };

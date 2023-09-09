import PyTerminal from '$lib/pylinux/terminal';
import { Linux } from '$lib/jslinux';

const MAGIC = /\[(?:geekpy|root)@localhost .+\]\$ $/;
export default class PyLinux extends Linux(PyTerminal) {
	constructor(config: string) {
		super(config);
	}

	public cmd(text: string): void {
		this.puts(text + '\x0d');
	}

	public async exec(text: string): Promise<string> {
		await this.terminal.park();
		const promise = this.terminal.wait((str) => MAGIC.test(str));
		this.cmd(text);
		let result = await promise;
		result = result.substring(result.indexOf(text) + text.length + 1);
		result = result.replace(MAGIC, '');
		if (result.startsWith('\r') || result.startsWith('\n')) {
			result = result.substring(1);
		} else if (result.startsWith('\r\n')) {
			result = result.substring(2);
		}
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
		const promise = this.terminal.wait((str) => MAGIC.test(str));
		await super.boot();
		await promise;
		return this;
	}
}
export { PyTerminal };

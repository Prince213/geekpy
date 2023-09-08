import PyTerminal from '$lib/pylinux/terminal';
import { Linux } from '$lib/jslinux';

const MAGIC = /\r\n\[(geekpy)|(root)@localhost .+\]\$ $/;
export default class PyLinux extends Linux(PyTerminal) {
	constructor(config: string) {
		super(config);
	}

	public cmd(text: string): void {
		this.puts(text + '\x0d');
	}

	public async exec(text: string): Promise<string> {
		const promise = this.terminal.wait((str) => MAGIC.test(str));
		this.cmd(text);
		let result = await promise;
		result = result.split('\r\n').slice(1, -1).join('\r\n');
		return result;
	}

	public async calibrate(cmd = 'echo $?', expect = '0'): Promise<boolean> {
		const result = await this.exec(cmd);
		return result === expect;
	}

	public async boot(): Promise<this> {
		const promise = this.terminal.wait((str) => MAGIC.test(str));
		await super.boot();
		await promise;
		return this;
	}
}
export { PyTerminal };

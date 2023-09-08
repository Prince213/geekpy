import PyTerminal from '$lib/pylinux/terminal';
import { Linux } from '$lib/jslinux';

export default class PyLinux extends Linux(PyTerminal) {
	constructor(config: string) {
		super(config);
	}

	public cmd(text: string): void {
		this.puts(text + '\x0d');
	}

	public async exec(text: string): Promise<string> {
		const regex = /\r\n\[(geekpy)|(root)@localhost .+\]\$ $/;
		const promise = this.terminal.wait((str) => regex.test(str));
		this.cmd(text);
		let result = await promise;
		result = result.split('\r\n').slice(1, -1).join('\r\n');
		return result;
	}
}
export { PyTerminal };

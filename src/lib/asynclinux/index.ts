import AsyncTerminal from '$lib/asynclinux/terminal';
import AsyncDaemon from '$lib/asynclinux/daemon';
import { Linux } from '$lib/jslinux';

const ASCIIEnter = '\x0d';
const ASCIIEOM = '\x03';

const CMD_MAGIC = /\[(?:geekpy|root)@localhost .+\]\$ $/;
const TASK_MAGIC = /y\[wqhHpsu#%adftr\*K6\]-86\?hn8Jmm\*A \[(\d+)\]/;

function trimStartString(str: string, prefix: string): string {
	if (str.startsWith(prefix)) {
		return str.substring(prefix.length);
	}
	return str;
}

export default class AsyncLinux extends Linux(AsyncTerminal) {
	constructor(config: string) {
		super(config);
	}

	private cmd(text: string): void {
		this.puts(text + ASCIIEnter);
	}

	public async kill(): Promise<void> {
		const pid = await this.exec(`ps -ef | grep '[s]pawn' | awk '{print $1}'`);
		this.terminal.kill();
		this.cmd(`kill -9 ${pid}`);
	}

	public async spawn(cmd: string): Promise<number | null> {
		await this.terminal.block();
		const promise = this.terminal.watch((str) => TASK_MAGIC.test(str));
		await this.exec(`./spawn.sh ${cmd}`);
		const result = await promise;
		if (result === null) {
			return null;
		}

		const match = TASK_MAGIC.exec(result);
		if (match === null) {
			return null;
		}

		return parseInt(match[1]);
	}

	public async abort(): Promise<void> {
		this.terminal.abort();
		this.cmd(ASCIIEOM);
	}

	public async exec(text: string): Promise<string | null> {
		await this.terminal.park();
		const promise = this.terminal.wait((str) => CMD_MAGIC.test(str));
		this.cmd(text);
		let result = await promise;
		if (result === null) {
			return null;
		}

		result = trimStartString(result, `${text}\r\n`);
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
		const promise = this.terminal.wait((str) => CMD_MAGIC.test(str));
		await super.boot();
		await promise;
		return this;
	}
}
export { AsyncTerminal, AsyncDaemon };

/*
 * JS Linux main
 *
 * Copyright (c) 2017 Fabrice Bellard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

import JSTerminal from '$lib/jslinux/terminal';
import type { Constructor, ITerminal, TerminalHandler } from '$lib/jslinux/terminal';
import _start from '$lib/jslinux/riscvemu64-wasm';
import { getAbsoluteUrl } from '$lib/utils/url';

type CWrap = (
	name: string,
	returnType: string | null,
	argTypes: (string | null)[]
) => (...args: unknown[]) => unknown;
type CCall = (
	func: string,
	returnType: string | null,
	argTypes: (string | null)[],
	args: unknown[]
) => unknown;

type RISCVEmu64Internal = {
	cwrap?: CWrap;
	ccall?: CCall;
	preRun?: VoidFunction;

	[key: string]: unknown;
};

export interface ILinux {
	boot(): void;
	mount(container: HTMLElement): void;
	puts(str: string): void;
}

export function Linux<TBase extends ITerminal>(Base: Constructor<TBase>) {
	return class WebLinux implements ILinux {
		private readonly terminal: TBase;
		private readonly internal: RISCVEmu64Internal;

		private putchar?: (c: number) => void;

		private started = false;

		constructor(config: string) {
			this.terminal = new Base(80, 30, (str: string) => this.puts(str));

			this.internal = {
				preRun: () => {
					/* C functions called from javascript */
					this.putchar = this.internal.cwrap?.('console_queue_char', null, ['number']);

					this.internal.ccall?.(
						'vm_start',
						null,
						['string', 'number', 'string', 'string', 'number', 'number', 'number', 'string'],
						[getAbsoluteUrl(config), 128, '', '', 0, 0, 0, '']
					);
				}
			};
		}

		public mount(container: HTMLElement) {
			this.terminal.open(container);
			return this;
		}

		public boot() {
			if (!this.started) {
				this.terminal.write('Loading...\r\n');
				_start(this.internal, this.terminal, null, null);
				this.started = true;
			}
			return this;
		}

		public puts(str: string) {
			if (this.putchar) {
				for (let i = 0; i < str.length; i++) {
					this.putchar(str.charCodeAt(i));
				}
			}
			return this;
		}
	};
}

const JSLinux = Linux(JSTerminal);

export default JSLinux;
export { ITerminal, TerminalHandler, JSTerminal };

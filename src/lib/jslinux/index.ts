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

import Term from '$lib/jslinux/term';
import _start from '$lib/jslinux/riscvemu64-wasm';

function getAbsoluteUrl(file: string) {
	if (file.indexOf(':') >= 0) return file;
	const path = window.location.pathname;
	const p = path.lastIndexOf('/');
	if (p < 0) return file;
	return window.location.origin + path.slice(0, p + 1) + file;
}

type Nullable<T> = T | null;
type CWrap = (
	name: string,
	returnType: Nullable<string>,
	argTypes: Nullable<string>[]
) => (...args: unknown[]) => unknown;
type CCall = (
	func: string,
	returnType: Nullable<string>,
	argTypes: Nullable<string>[],
	args: unknown[]
) => unknown;

interface RISCVEmu64Internal {
	cwrap?: CWrap;
	ccall?: CCall;
	preRun?: VoidFunction;

	[key: string]: unknown;
}

export default class JSLinux {
	private readonly term: Term;
	private readonly internal: RISCVEmu64Internal;

	private putchar?: (c: number) => void;

	private started = false;

	constructor(config: string) {
		/* start the terminal */
		this.term = new Term(80, 30, (str: string) => this.puts(str));

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
		this.term.open(container);
		return this;
	}

	public boot() {
		if (!this.started) {
			this.term.write('Loading...\r\n');
			_start(this.internal, this.term, null, null);
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
}

export enum HistorySource {
	Input,
	Output
}

export type HistoryItem = {
	source: HistorySource;
	value: string;
};

export class History {
	private items: HistoryItem[] = [];

	constructor() {
		this.items = [];
	}

	public push(item: HistoryItem) {
		this.items.push(item);
	}

	public get() {
		return this.items;
	}

	public from(raw: string | null): string | null {
		if (!raw) return null;
		for (const item of this.items.filter((item) => item.source === HistorySource.Output)) {
			if (raw.startsWith(item.value)) {
				raw = raw.slice(item.value.length);
			} else {
				break;
			}
		}
		if (raw) {
			this.push({ source: HistorySource.Output, value: raw });
		}
		return this.toString();
	}

	public toString() {
		return this.items.map((item) => item.value).join('\n');
	}

	public clear() {
		this.items = [];
	}
}

export function getAbsoluteUrl(file: string) {
	if (file.indexOf(':') >= 0) return file;
	const path = window.location.pathname;
	const p = path.lastIndexOf('/');
	if (p < 0) return file;
	return window.location.origin + path.slice(0, p + 1) + file;
}

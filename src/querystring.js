export function querystring(obj) {
	if (Object.prototype.toString.call(obj) === '[object Object]') {
		return Object.keys(obj)
			.map(
				k =>
					Array.isArray(obj[k])
						? obj[k]
							.map(v => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
							.join('&')
						: `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`
			)
			.join('&');
	} else if (typeof obj === 'string') {
		return obj;
	} else {
		return JSON.stringify(obj);
	}
}
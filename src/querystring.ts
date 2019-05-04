import { Serialize2QueryString } from './core';

export const querystring: Serialize2QueryString = function (obj: any): string {
	if (Object.prototype.toString.call(obj) === '[object Object]') {
		return Object.keys(obj)
			.map(
				(k: string) =>
					Array.isArray(obj[k])
						? obj[k]
							.map((v: any) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
							.join('&')
						: `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`
			)
			.join('&');
	} else if (typeof obj === 'string') {
		return obj;
	} else {
		return JSON.stringify(obj);
	}
};
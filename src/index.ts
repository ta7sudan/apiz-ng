import { config } from './core';
import { querystring } from './querystring';

config({
	querystring,
	defaultContentType: 'json',
	defaultResponseType: 'json'
});

export * from './core';

export * from './querystring';
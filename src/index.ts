import { config } from './core';
import { querystring } from './querystring';

config({
	querystring,
	defaultType: 'json'
});

export * from './core';
import test from 'ava';
import pock from 'pock/src/server';
import { resolve } from 'path';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';

const pockrc = resolve(__dirname, '../.pockrc.yml');
let server = null;

test.before(async () => {
	const options = safeLoad(readFileSync(pockrc, 'utf8'));
	server = await pock(options, resolve(__dirname, '..'));
});

test.after(async () => {
	server.close();
});


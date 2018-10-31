import test from 'ava';
import meta from './_meta';
import apizclient from 'apiz-node-client';
import { APIz, config } from '../src';
import './_pock';

const isObj = o => Object.prototype.toString.call(o) === '[object Object]';

test.before(() => {
	config({
		immutableMeta: true
	});
});

test('get with params', async t => {
	const apis = new APIz(meta, {
		client: apizclient({
			beforeRequest: [
				options => {
					t.true(isObj(options));
				}
			],
			afterResponse: [
				resp => {
					t.is(resp.body, JSON.stringify({
						name: 'CSAPP',
						version: '2'
					}));
					return resp;
				}
			]
		})
	});

	let resp = await apis.getBook(
		{
			bookName: 'CSAPP',
			other: 'test'
		},
		{
			version: 2,
			otherKey: '测试'
		}
	);
	t.is(resp.body, JSON.stringify({
		name: 'CSAPP',
		version: '2'
	}));
});


test('get without query', async t => {
	const apis = new APIz(meta, {
		client: apizclient({
			beforeRequest: [
				options => {
					t.true(isObj(options));
				}
			],
			afterResponse: [
				resp => {
					t.is(resp.body, JSON.stringify({
						name: 'SICP',
						price: '30$'
					}));
					return resp;
				}
			]
		})
	});

	let resp = await apis.getBook({
		bookName: 'SICP'
	});

	t.is(resp.body, JSON.stringify({
		name: 'SICP',
		price: '30$'
	}));
});


test('head with query', async t => {
	const apis = new APIz(meta, {
		client: apizclient({
			beforeRequest: [
				options => {
					t.true(isObj(options));
				}
			],
			afterResponse: [
				resp => {
					t.true(true);
					return resp;
				}
			]
		})
	});

	let resp = await apis.queryBook({
		bookName: 'CSAPP'
	}, {
		version: 2
	});

	t.is(resp.body, '');
});


test('post with body', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.addBook({
		bookName: 'HTDP'
	});

	t.deepEqual(resp.body, {
		info: {
			bookName: 'HTDP'
		},
		message: 'post'
	});
});


test('post with body and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.addBook({
		bookName: 'HTDP'
	}, {
		version: 1
	});

	t.deepEqual(resp.body, {
		info: {
			bookName: 'HTDP'
		},
		message: 'post'
	});
});

test('post without body', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.addBook();

	t.is(resp.body, JSON.stringify({
		info: null,
		message: 'post'
	}));
});

test('put with body, params and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.updateBook({
		body: 'put'
	}, {
		bookName: 'CSAPP'
	}, {
		query: 'aaa'
	});

	t.deepEqual(resp.body, {
		info: {
			body: 'put'
		},
		message: 'put'
	});
});

test('put with body and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.updateBook({
		body: 'put'
	}, {
		bookName: 'CSAPP'
	});

	t.deepEqual(resp.body, {
		info: {
			body: 'put'
		},
		message: 'put'
	});
});

test('put without body', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.updateBook(null, {
		bookName: 'CSAPP'
	});

	t.is(resp.body, JSON.stringify({
		info: null,
		message: 'put'
	}));
});

test('patch with body, params, query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.modifyBook({
		body: 'patch'
	}, {
		bookName: 'SICP'
	}, {
		query0: 111,
		query1: '测试'
	});

	t.deepEqual(resp.body, {
		info: {
			body: 'patch'
		},
		message: 'patch'
	});
});

test('patch with body, params', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.modifyBook({
		body: 'patch'
	}, {
		bookName: 'SICP'
	});

	t.deepEqual(resp.body, {
		info: {
			body: 'patch'
		},
		message: 'patch'
	});
});

test('patch without body', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.modifyBook(null, {
		bookName: 'SICP'
	});

	t.is(resp.body, JSON.stringify({
		info: null,
		message: 'patch'
	}));
});

test('delete with params and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.removeBook({
		bookName: 'HTDP'
	}, {
		query0: 111,
		query1: '测试'
	});

	t.is(resp.body, JSON.stringify({
		info: null,
		message: 'delete'
	}));
});

test('delete with params', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.removeBook({
		bookName: 'HTDP'
	});

	t.is(resp.body, JSON.stringify({
		info: null,
		message: 'delete'
	}));
});

test('options with params and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.optionsBook({
		bookName: 'CSAPP'
	}, {
		query0: 111,
		query1: '测试'
	});

	t.is(resp.body, JSON.stringify({
		info: null,
		message: 'options'
	}));
});

test('get with raw options', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.getBook({
		query: {
			q0: '000',
			version: 1
		}
	}, true);

	t.is(resp.body, JSON.stringify({
		name: ':bookName',
		version: '1'
	}));
});

test('post with raw options', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.addBook({
		body: {
			bookName: 'CSAPP'
		},
		query: {
			q0: '000',
			q1: 111
		},
		json: true
	}, true);

	t.deepEqual(resp.body, {
		info: {
			bookName: 'CSAPP'
		},
		message: 'post'
	});
});

test('put with buffer, params, query and type', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.updateBook(buf, {
		bookName: 'buf'
	}, {
		key0: '000',
		key1: 111
	}, 'json');

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'put'
	}));
});

test('put with buffer, params, query typed string and type', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.updateBook(buf, {
		bookName: 'buf'
	}, 'key0=000&key1=111', 'json');

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'put'
	}));
});

test('put with buffer, params, query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.updateBook(buf, {
		bookName: 'buf'
	}, {
		key0: '000',
		key1: 111
	});

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'put'
	}));
});

test('put with buffer, params, query typed string', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.updateBook(buf, {
		bookName: 'buf'
	}, 'key0=000&key1=111');

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'put'
	}));
});

test('put with buffer, params', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.updateBook(buf, {
		bookName: 'buf'
	});

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'put'
	}));
});

test('post with buffer, query and type', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook(buf, {
		key0: '000',
		key1: 111
	}, 'json');

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'post'
	}));
});

test('post with buffer, query typed string and type', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook(buf, 'key0=000&key1=111', 'json');

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'post'
	}));
});

test('post with buffer and type', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook(buf, 'json');

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'post'
	}));
});

test('post with buffer and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook(buf, {
		key0: '000',
		key1: 111
	});

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'post'
	}));
});

test('post with buffer and query typed string', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook(buf, 'key0=000&key1=111');

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		message: 'post'
	}));
});
import test from 'ava';
import meta from './_meta';
import apizclient from 'apiz-node-client';
import { APIz, config } from '../test_cache';
import './_pock';

const isObj = o => Object.prototype.toString.call(o) === '[object Object]';

test.before(() => {
	config({
		immutable: true
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
			params: {
				bookName: 'CSAPP',
				other: 'test'
			},
			query: {
				version: 2,
				otherKey: '测试'
			}
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
		params: {
			bookName: 'SICP'
		}
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
		params: {
			bookName: 'CSAPP'
		},
		query: {
			version: 2
		}
	});

	t.is(resp.body, '');
});


test('post with body', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.addBook({
		body: {
			bookName: 'HTDP'
		}
	});

	t.deepEqual(resp.body, {
		info: {
			bookName: 'HTDP'
		},
		version: 1,
		message: 'post'
	});
});


test('post with body and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.addBook({
		body: {
			bookName: 'HTDP'
		},
		query: {
			version: 2
		}
	});

	t.deepEqual(resp.body, {
		info: {
			bookName: 'HTDP',
		},
		version: 2,
		message: 'post'
	});
});

test('post without body', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.addBook();

	t.deepEqual(resp.body, {
		info: null,
		version: 1,
		message: 'post'
	});
});

test('put with body, params and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.updateBook({
		body: {
			body: 'put'
		},
		params: {
			bookName: 'CSAPP'
		},
		query: {
			query: 'aaa'
		}
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
		body: {
			body: 'put'
		},
		params: {
			bookName: 'CSAPP'
		}
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

	let resp = await apis.updateBook({
		params: {
			bookName: 'CSAPP'
		}
	});

	t.deepEqual(resp.body, {
		info: null,
		message: 'put'
	});
});

test('patch with body, params, query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.modifyBook({
		body: {
			body: 'patch'
		},
		params: {
			bookName: 'SICP'
		},
		query: {
			query0: 111,
			query1: '测试'
		}
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
		body: {
			body: 'patch'
		},
		params: {
			bookName: 'SICP'
		}
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

	let resp = await apis.modifyBook({
		params: {
			bookName: 'SICP'
		}
	});

	t.deepEqual(resp.body, {
		info: null,
		message: 'patch'
	});
});

test('delete with params and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.removeBook({
		params: {
			bookName: 'HTDP'
		},
		query: {
			query0: 111,
			query1: '测试'
		}
	});

	t.deepEqual(resp.body, {
		info: null,
		message: 'delete'
	});
});

test('delete with params', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.removeBook({
		params: {
			bookName: 'HTDP'
		}
	});

	t.deepEqual(resp.body, {
		info: null,
		message: 'delete'
	});
});

test('options with params and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	let resp = await apis.optionsBook({
		params: {
			bookName: 'CSAPP'
		},
		query: {
			query0: 111,
			query1: '测试'
		}
	});

	t.deepEqual(resp.body, {
		info: null,
		message: 'options'
	});
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
		version: 1,
		message: 'post'
	});
});

test('put with buffer, params, query and type', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.updateBook({
		body: buf,
		params: {
			bookName: 'buf'
		},
		query: {
			key0: '000',
			key1: 111
		},
		type: 'json'
	});

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
	let resp = await apis.updateBook({
		body: buf,
		params: {
			bookName: 'buf'
		},
		query: 'key0=000&key1=111',
		type: 'json'
	});

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
	let resp = await apis.updateBook({
		body: buf,
		params: {
			bookName: 'buf'
		},
		query: {
			key0: '000',
			key1: 111
		}
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
	let resp = await apis.updateBook({
		body: buf,
		params: {
			bookName: 'buf'
		},
		query: 'key0=000&key1=111'
	});

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
	let resp = await apis.updateBook({
		body: buf,
		params: {
			bookName: 'buf'
		}
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
	let resp = await apis.addBook({
		body: buf,
		query: {
			key0: '000',
			key1: 111
		},
		type: 'json'
	});

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		version: 1,
		message: 'post'
	}));
});

test('post with buffer, query typed string and type', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook({
		body: buf,
		query: 'key0=000&key1=111',
		type: 'json'
	});

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		version: 1,
		message: 'post'
	}));
});

test('post with buffer and type', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook({
		body: buf,
		type: 'json'
	});

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		version: 1,
		message: 'post'
	}));
});

test('post with buffer and query', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook({
		body: buf,
		query: {
			key0: '000',
			key1: 111
		}
	});

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		version: 1,
		message: 'post'
	}));
});

test('post with buffer and query typed string', async t => {
	const apis = new APIz(meta, {
		client: apizclient()
	});

	const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	let resp = await apis.addBook({
		body: buf,
		query: 'key0=000&key1=111'
	});

	t.is(resp.body, JSON.stringify({
		info: {
			bookName: 'buffer'
		},
		version: 1,
		message: 'post'
	}));
});
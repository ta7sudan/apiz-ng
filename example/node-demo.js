const meta = require('./meta');
const apizclient = require('apiz-node-client');
const { APIz, config } = require('./scripts/apiz.umd');

// config();
// new APIz(meta);

// new APIz(meta);

// config({
// 	client: apizclient()
// });
// meta._baseURL = undefined;
// new APIz(meta);

// config({
// 	client: {
// 		get: 5
// 	}
// });
// new APIz(meta);

// config({
// 	client: apizclient()
// });
// meta.getBook.method = 'test';
// new APIz(meta);






(async () => {
	config({
		immutableMeta: true
	});
	const apis = new APIz(meta, {
		client: apizclient({
			beforeRequest: [options => {
				console.log('before');
			}],
			afterResponse: [resp => {
				console.log('after');
				return resp;
			}]
		})
	});

	// let resp = await apis.getBook({
	// 	bookName: 'CSAPP',
	// 	other: 'test'
	// }, {
	// 		version: 2,
	// 		otherKey: '测试'
	// 	});
	// console.log(resp.body);


	// resp = await apis.getBook({
	// 	bookName: 'SICP'
	// });
	// console.log(resp.body);

	// resp = await apis.queryBook({
	// 	bookName: 'CSAPP'
	// }, {
	// 		version: 2
	// 	});
	// console.log(resp.body);

	// resp = await apis.addBook({
	// 	bookName: 'HTDP'
	// });
	// console.log(resp.body);

	// resp = await apis.addBook({
	// 	bookName: 'HTDP'
	// }, {
	// 		version: 1
	// 	});
	// console.log(resp.body);

	// resp = await apis.addBook();
	// console.log(resp.body);


	// resp = await apis.updateBook({
	// 	body: 'put'
	// }, {
	// 		bookName: 'CSAPP'
	// 	}, {
	// 		query: 'aaa'
	// 	});
	// console.log(resp.body);

	// resp = await apis.updateBook({
	// 	body: 'put'
	// }, {
	// 		bookName: 'CSAPP'
	// 	});
	// console.log(resp.body);

	// resp = await apis.updateBook(null, {
	// 	bookName: 'CSAPP'
	// });
	// console.log(resp.body);

	// resp = await apis.modifyBook({
	// 	body: 'patch'
	// }, {
	// 		bookName: 'SICP'
	// 	}, {
	// 		query0: 111,
	// 		query1: '测试'
	// 	});
	// console.log(resp.body);

	// resp = await apis.modifyBook({
	// 	body: 'patch'
	// }, {
	// 		bookName: 'SICP'
	// 	});
	// console.log(resp.body);

	// resp = await apis.modifyBook(null, {
	// 	bookName: 'SICP'
	// });
	// console.log(resp.body);

	// resp = await apis.removeBook({
	// 	bookName: 'HTDP'
	// }, {
	// 		query0: 111,
	// 		query1: '测试'
	// 	});
	// console.log(resp.body);

	// resp = await apis.removeBook({
	// 	bookName: 'HTDP'
	// });
	// console.log(resp.body);

	// resp = await apis.optionsBook({
	// 	bookName: 'CSAPP'
	// }, {
	// 		query0: 111,
	// 		query1: '测试'
	// 	});
	// console.log(resp.body);

	// resp = await apis.getBook({
	// 	query: {
	// 		q0: '000',
	// 		q1: 111
	// 	}
	// }, true);
	// console.log(resp.body);

	// resp = await apis.addBook({
	// 	body: {
	// 		bookName: 'CSAPP'
	// 	},
	// 	query: {
	// 		q0: '000',
	// 		q1: 111
	// 	},
	// 	json: true
	// }, true);
	// console.log(resp.body);
	
	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, {
	// 	key0: '000',
	// 	key1: 111
	// }, 'json');
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, 'key0=000&key1=111', 'json');
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, 'json');
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, {
	// 	key0: '000',
	// 	key1: 111
	// });
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, 'key0=000&key1=111');
	// console.log(resp.body)

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// });
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.addBook(buf, {
	// 	key0: '000',
	// 	key1: 111
	// }, 'json');
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.addBook(buf, 'key0=000&key1=111', 'json');
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.addBook(buf, 'json');
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.addBook(buf, {
	// 	key0: '000',
	// 	key1: 111
	// });
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.addBook(buf, 'key0=000&key1=111');
	// console.log(resp.body);

	// const buf = Buffer.from(JSON.stringify({ bookName: 'buffer' }), 'utf8');
	// resp = await apis.addBook(buf);
	// console.log(resp.body);
	
})();

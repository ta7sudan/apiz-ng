var {APIz, config} = APIz;
var meta = meta;
function getStrLength(str) {
	var rst = str.match(/[\s\S]/gu);
	return rst ? rst.length : 0;
}

function str2ab(str) {
  var buf = new ArrayBuffer(getStrLength(str));
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=getStrLength(str); i < strLen; i++) {
    bufView[i] = str.codePointAt(i);
  }
  return buf;
}

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
		immutable: true
	});
	const apis = new APIz(meta, {
		client: apizclient({
			beforeSend(xhr, options) {
				console.log('before');
			},
			afterResponse(data, xhr) {
				console.log('after');
			},
			error(type) {
				console.log(type);
				return true;
			},
			retry: 2
		})
	});

	let resp = await apis.getBook({
		params: {
			bookName: 'CSAPP',
			other: 'test'
		},
		query: {
			version: 2,
			otherKey: '测试'
		},
		handleError: true
	});
	console.log(resp);


	// resp = await apis.getBook({
	// 	bookName: 'SICP'
	// });
	// console.log(resp);

	// resp = await apis.queryBook({
	// 	bookName: 'CSAPP'
	// }, {
	// 		version: 2
	// 	});
	// console.log(resp);

	// resp = await apis.addBook({
	// 	bookName: 'HTDP'
	// });
	// console.log(resp);

	// resp = await apis.addBook({
	// 	bookName: 'HTDP'
	// }, {
	// 		version: 1
	// 	});
	// console.log(resp);

	// resp = await apis.addBook();
	// console.log(resp);


	// resp = await apis.updateBook({
	// 	body: 'put'
	// }, {
	// 		bookName: 'CSAPP'
	// 	}, {
	// 		query: 'aaa'
	// 	});
	// console.log(resp);

	// resp = await apis.updateBook({
	// 	body: 'put'
	// }, {
	// 		bookName: 'CSAPP'
	// 	});
	// console.log(resp);

	// resp = await apis.updateBook(null, {
	// 	bookName: 'CSAPP'
	// });
	// console.log(resp);

	// resp = await apis.modifyBook({
	// 	body: 'patch'
	// }, {
	// 		bookName: 'SICP'
	// 	}, {
	// 		query0: 111,
	// 		query1: '测试'
	// 	});
	// console.log(resp);

	// resp = await apis.modifyBook({
	// 	body: 'patch'
	// }, {
	// 		bookName: 'SICP'
	// 	});
	// console.log(resp);

	// resp = await apis.modifyBook(null, {
	// 	bookName: 'SICP'
	// });
	// console.log(resp);

	// resp = await apis.removeBook({
	// 	bookName: 'HTDP'
	// }, {
	// 		query0: 111,
	// 		query1: '测试'
	// 	});
	// console.log(resp);

	// resp = await apis.removeBook({
	// 	bookName: 'HTDP'
	// });
	// console.log(resp);

	// resp = await apis.optionsBook({
	// 	bookName: 'CSAPP'
	// }, {
	// 		query0: 111,
	// 		query1: '测试'
	// 	});
	// console.log(resp);

	// resp = await apis.getBook({
	// 	headers: {
	// 		'custom-header': 'test'
	// 	}
	// }, true);
	// console.log(resp);

	// resp = await apis.addBook({
	// 	data: {
	// 		bookName: 'CSAPP'
	// 	},
	// 	dataType: 'json'
	// }, true);
	// console.log(resp);
	
	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, {
	// 	key0: '000',
	// 	key1: 111
	// }, 'json');
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, 'key0=000&key1=111', 'json');
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, 'json');
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, {
	// 	key0: 000,
	// 	key1: 111
	// });
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// }, 'key0=000&key1=111');
	// console.log(resp)

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.updateBook(buf, {
	// 	bookName: 'buf'
	// });
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.addBook(buf, {
	// 	key0: 000,
	// 	key1: 111
	// }, 'json');
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.addBook(buf, 'key0=000&key1=111', 'json');
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.addBook(buf, 'json');
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.addBook(buf, {
	// 	key0: 000,
	// 	key1: 111
	// });
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.addBook(buf, 'key0=000&key1=111');
	// console.log(resp);

	// const buf = str2ab(JSON.stringify({ bookName: 'buffer' }));
	// resp = await apis.addBook(buf);
	// console.log(resp);
	
})();

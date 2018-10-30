module.exports = {
	'get /book/:bookName': async (req, res) => {
		return req.query.version
			? {
				name: req.params.bookName,
				version: req.query.version
			}
			: {
				name: req.params.bookName,
				price: '30$'
			};
	},
	// head响应不带body, 所以这里body其实不会被发送
	'head /book/:bookName': async req => {
		return {
			name: req.params.bookName,
			version: req.query.version || 1,
			message: 'head'
		};
	},
	'post /book': async req => {
		console.log(req.body);
		return {
			info: req.body,
			message: 'post'
		};
	},
	'put /book/:bookName': async req => {
		console.log(req.body);
		return {
			info: req.body,
			message: 'put'
		};
	},
	'patch /book/:bookName': async req => {
		console.log(req.body);
		return {
			info: req.body,
			message: 'patch'
		};
	},
	'delete /book/:bookName': async req => {
		return {
			info: req.body,
			message: 'delete'
		};
	},
	'options /book/:bookName': async req => {
		return {
			info: req.body,
			message: 'options'
		};
	},
};

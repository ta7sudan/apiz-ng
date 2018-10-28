const {APIz, config} = require('./scripts/apiz.umd');

config({
	// immutableMeta: true,
	client: {
		get() {}
	}
});

const apiMeta = {
	_baseURL: 'http://www.a.com',
	getBook: 233
};

const apis = new APIz(apiMeta);

apis.getBook();
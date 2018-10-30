module.exports = {
	_baseURL: 'http://127.0.0.1:8080',
	getBook: {
		path: '/book/:bookName',
		pathParams: true
	},
	queryBook: {
		path: '/book/:bookName',
		pathParams: true,
		method: 'head'
	},
	addBook: {
		path: '/book',
		method: 'post',
		type: 'json'
	},
	updateBook: {
		path: '/book/:bookName',
		method: 'put',
		pathParams: true,
		type: 'json'
	},
	modifyBook: {
		path: '/book/:bookName',
		method: 'patch',
		pathParams: true,
		type: 'json'
	},
	removeBook: {
		path: '/book/:bookName',
		method: 'delete',
		pathParams: true,
		type: 'json'
	},
	optionsBook: {
		path: '/book/:bookName',
		method: 'options',
		pathParams: true,
		type: 'json'
	}
};
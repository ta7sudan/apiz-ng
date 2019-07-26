module.exports = {
	_baseURL: 'http://127.0.0.1:8080',
	getBook: {
		path: '/book/:bookName'
	},
	queryBook: {
		path: '/book/:bookName',
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
		type: 'json'
	},
	modifyBook: {
		path: '/book/:bookName',
		method: 'patch',
		type: 'json'
	},
	removeBook: {
		path: '/book/:bookName',
		method: 'delete',
		type: 'json'
	},
	optionsBook: {
		path: '/book/:bookName',
		method: 'options',
		type: 'json'
	}
};
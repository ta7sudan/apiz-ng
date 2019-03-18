import { APIMeta, APIzClient, HTTPMethodLowerCase } from './index';
import { APIz, APIzOptions } from './core';


const meta: APIMeta<'json' | 'form', object> = {
	getBooks: {
		path: '/books',
		type: 'form'
	},
	addBook: {
		baseURL: 'http://localhost',
		path: '/books',
		method: 'DELETE'
	}
};

type ClientOptions = {
	aaabd: 'test'
}

type Client = APIzClient<'json' | 'form', object, ClientOptions, HTTPMethodLowerCase>;

const client: Client = {
	get() {
		return Promise.resolve(5);
	}
};

const apis = APIz<'json' | 'form', object, ClientOptions, Client, typeof meta>({
	getBooks: {
		path: '/books',
		type: 'form'
	},
	addBook: {
		baseURL: 'http://localhost',
		path: '/books',
		method: 'DELETE'
	}
}, {
	client 
});

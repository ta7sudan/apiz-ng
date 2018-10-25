import test from 'ava';
import './_pock';

/* global todo */

/**
 * AVA 默认不处理src下面的文件, 所以需要@babel/register
 * 对于async, 还需要@babel/polyfill, 这些都在package.json中配置
 * 另外由于tree shaking的需要, 全局的babel配置是不会将ES module
 * 语法转换成CommonJS的(modules: false), 所以需要覆盖掉全局babel配置
 */

// const sleep = time => new Promise(rs => setTimeout(rs, time));
// const isObj = o => Object.prototype.toString.call(o) === '[object Object]';

test('todo', async (t, page) => {
	t.pass();
});

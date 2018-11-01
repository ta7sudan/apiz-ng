import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import minify from 'rollup-plugin-babel-minify';
import { relative } from 'path';
import { browser, module, main, version, license, author, homepage } from './package.json';

/**
 * 如果用babel-minify压缩的话, banner字符串的开头和结尾谜之不能换行
 * 不过有一点好的是, 用rollup的banner字段和babel-minify的banner字段都可以
 * uglify的话则需要自己处理下注释
 */
/* eslint-disable-next-line */
const banner = `/**
 * @Version ${version}
 * @Author: ${author}
 * @Repo: ${homepage}
 * @License: ${license}
 */`;

/**
 * 为什么commonjs包要压一下? 反正要打个包, 不如压一下, 也不影响调试,
 * VSC支持sourcemap, 压完单个函数代码量少了"据说"可以有利于函数内联...
 */
export default [
	{
		input: 'src/index.js',
		plugins: [
			replace({
				DEBUG: JSON.stringify(false)
			}),
			babel({
				exclude: 'node_modules/**'
			})
		],
		treeshake: {
			propertyReadSideEffects: false
		},
		output: [
			{
				// banner,
				file: module,
				format: 'esm',
				sourcemap: true
			},
			{
				name: 'apizng',
				// banner,
				file: browser,
				format: 'umd',
				sourcemap: true
			}
		]
	},
	{
		input: 'src/index.js',
		plugins: [
			replace({
				DEBUG: JSON.stringify(false)
			}),
			babel({
				exclude: 'node_modules/**'
			}),
			minify({
				comments: false
			})
		],
		treeshake: {
			propertyReadSideEffects: false
		},
		output: [
			{
				name: 'apizng',
				banner,
				file: 'dist/apiz.min.js',
				format: 'umd',
				sourcemap: true,
				// sourcemap生成之后在devtools本来看到的文件是src/index.js, 这个选项可以变成apiz.js
				sourcemapPathTransform: path => (~path.indexOf('index') ? 'apiz.js' : relative('src', path))
			},
			{
				banner,
				file: main,
				format: 'cjs',
				sourcemap: true
			}
		]
	}
];

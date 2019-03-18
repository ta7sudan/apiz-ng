import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { relative } from 'path';

export default [{
	input: 'src/index.ts',
	plugins: [
		typescript({
			tsconfig: 'tsconfig.json',
			useTsconfigDeclarationDir: true
		}),
		replace({
			DEBUG: JSON.stringify(true)
		}),
		babel({
			exclude: 'node_modules/**'
		})
	],
	treeshake: {
		propertyReadSideEffects: false
	},
	output: {
		name: 'APIz',
		file: 'example/scripts/apiz.umd.js',
		format: 'umd',
		sourcemap: true,
		sourcemapPathTransform: path => (~path.indexOf('index') ? 'apiz.js' : relative('src', path))
	}
}, {
	input: 'example/apizclient.js',
	plugins: [
		resolve(),
		commonjs(),
		replace({
			DEBUG: JSON.stringify(true)
		}),
		babel({
			exclude: 'node_modules/**'
		})
	],
	treeshake: {
		propertyReadSideEffects: false
	},
	output: {
		name: 'apizclient',
		file: 'example/scripts/apizclient.js',
		format: 'umd',
		sourcemap: true
	}
}];

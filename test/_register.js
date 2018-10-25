import fs from 'fs';
import register from '@babel/register';
let babelConfig = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));
babelConfig.babelrc = false;
babelConfig.ignore = ['node_modules/**', 'test/**'];
babelConfig.presets[0][1].modules = 'commonjs';
register(babelConfig);

// Thank you: https://github.com/aidenlx/media-extended/blob/main/esbuild.js
import esbuild from 'esbuild';
import fs from 'fs';
import minify from 'css-minify';
import sass from 'sass'
import builtins from 'builtin-modules'

const license = `
	MIT License

	Copyright (c) 2021-2022 kometenstaub and contributors

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
`

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
If you want to view the source, visit the plugin's github repository:
https://github.com/kometenstaub/customizable-page-header-buttons

This plugin is MIT-licensed:
${license}

The commandSuggester, iconPicker, Obsidian icon names and the biggest part of the settings tab have been adapted from the Obsidian Customizable Sidebar Plugin (https://github.com/phibr0/obsidian-customizable-sidebar).
It is MIT-licensed:
	MIT License

	Copyright (c) 2021 Phillip

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

The workspace monkey-patching uses code from monkey-around, which is ISC-licensed.
https://github.com/pjeby/monkey-around

*/
`;

const copyManifest = {
	name: 'copy-manifest-and-styles',
	setup: (build) => {
		build.onEnd(() => {
			fs.copyFileSync('manifest.json', 'build/manifest.json');
		});
	},
};

const styleSettings = `
/* @settings

name: Customizable Page Header and Title Bar
id: customizable-page-header-buttons
settings:
    - 
        id: page-header-spacing-mobile
        title: Page Header Button Spacing (mobile)
        type: variable-number-slider
        default: 12
        min: 0
        max: 30
        step: 1
        format: px
    - 
        id: page-header-spacing-desktop
        title: Page Header Button Spacing (desktop)
        type: variable-number-slider
        default: 8
        min: 0
        max: 30
        step: 1
        format: px
    - 
        id: titlebar-button-horizontal-spacing
        title: Horizontal spacing of titlebar buttons
        type: variable-number-slider
        default: 16
        min: 4
        max: 16
        step: 1
        format: px
*/
`

const copyMinifiedCSS = {
	name: 'minify-css',
	setup: (build) => {
		build.onEnd(async () => {
			const {css} = sass.compile('src/styles.scss');
			const minCss = await minify(css);
			const content = `/*${license}*/\n${styleSettings}\n${minCss}`;
			fs.writeFileSync('build/styles.css', content, {encoding: 'utf-8'});
		})
	}
}


const isProd = process.env.BUILD === 'production';

(async () => {
	try {
		await esbuild.build({
			entryPoints: ['src/main.ts', 'src/styles.scss'],
			bundle: true,
			watch: !isProd,
			external: ['obsidian', 'electron', ...builtins],
			format: 'cjs',
			target: 'es2018',
			banner: { js: banner },
			sourcemap: isProd ? false : 'inline',
			minify: isProd,
			treeShaking: true,
			define: {
				'process.env.NODE_ENV': JSON.stringify(process.env.BUILD),
			},
			outdir: 'build/',
			logLevel: 'info',
			plugins: [copyManifest, copyMinifiedCSS],
			loader: { '.scss': 'text' }
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();

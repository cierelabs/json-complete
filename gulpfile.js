const { Readable, Transform } = require('stream'); // Built-in
const browserify = require('browserify');
const browserSync = require('browser-sync');
const del = require('del');
const fs = require('fs'); // Built-in
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpBrotli = require('gulp-brotli');
const gulpFile = require('gulp-file');
const gulpGzip = require('gulp-gzip');
const gulpRename = require('gulp-rename');
const gulpTape = require('gulp-tape');
const gulpTerser = require('gulp-terser');
const gulpZopfliGreen = require('gulp-zopfli-green');
const path = require('path'); // Built-in
const rollup = require('rollup');
const rollupPluginRootImport = require('rollup-plugin-root-import');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');

const p = {
    src: `${__dirname}/src`,
    testSrc: './src/tests',
    dist: './dist',
    testBrowser: './_testing/browser',
    testNode: './_testing/node',
    compression: './_testing/compression',
};

function onError(e) {
    console.error(e); // eslint-disable-line no-console
    this.emit('end');
}

const updateContents = (fn) => {
    const transformer = new Transform({
        objectMode: true,
    });

    transformer._transform = (file, enc, cb) => {
        if (file.isBuffer()) {
            const changes = fn(String(file.contents), file);

            if (changes || changes === '') {
                file.contents = Buffer.from(changes);
            }
        }

        cb(null, file);
    };

    return transformer;
};

const babelModern = (stream) => {
    stream = stream.pipe(gulpBabel({
        sourceType: 'script', // Prevents adding of strict mode automatically, which can break some require declarations
        presets: [
            ['@babel/env', {
                targets: {
                    browsers: [
                        '> 0.2%, ie >= 9, not ie <= 8, not op_mini all',
                    ],
                },
                loose: true, // Safe because typeof x === 'object' will never be called relative to a Symbol
            }],
        ],
    }));
    stream = stream.on('error', onError);

    return stream;
};

const babelNodePassthrough = (stream) => {
    stream = stream.pipe(gulpBabel({
        plugins: [
            ['module-resolver', { root: [p.src] }],
            'babel-plugin-transform-esm-to-cjs'
        ],
    }));

    return stream;
};

const jsBuild = (options) => {
    const format = options.format || 'iife';

    return rollup.rollup({
        input: options.src,
        plugins: [
            rollupPluginRootImport({
                root: p.src,
            }),
        ],
    }).then((bundler) => {
        return bundler.generate({
            format: format,
        });
    }).then((bundlerOutput) => {
        const { output } = bundlerOutput;

        // Can't just return the stream in this case
        return new Promise((resolve) => {
            let stream = gulpFile(options.filename, output[0].code, { src: true });

            // ESM output guarantees a certain level of ES support, which the library itself is tied to
            if (format !== 'esm') {
                stream = babelModern(stream);
            }

            stream = stream.pipe(updateContents((contents) => {
                return ['/* @license BSL-1.0 https://git.io/fpQEc */', contents].join('\n');
            }));

            // Export unminified
            stream = stream.pipe(gulp.dest(options.dest));

            // Export minified
            if (options.minify) {
                stream = stream.pipe(gulpTerser({
                    mangle: {
                        toplevel: true,
                        properties: {
                            regex: /_\w+/, // Compress all properties that start with _, but contain more than just an underscore
                        },
                    },
                    compress: {
                        inline: true,
                    },
                    output: {
                        comments: 'some',
                    },
                }));

                stream = stream.on('error', onError);

                stream = stream.pipe(gulpRename({
                    suffix: '.min',
                }));

                stream = stream.pipe(gulp.dest(options.dest));
            }

            stream = stream.on('end', resolve);

            return stream;
        });
    });
};

const genCompression = (fn) => {
    let stream = gulp.src(`${p.dist}/*.min.js`);
    stream = stream.pipe(gulp.dest(p.compression));
    stream = fn(stream);
    stream = stream.pipe(gulp.dest(p.compression));
    return stream;
};



gulp.task('clear-browser', () => {
    return del([p.testBrowser]);
});

gulp.task('build-browser-js-tape', () => {
    // http://stackoverflow.com/a/36042506
    const s = new Readable();
    s.push('"";'); // No contents required, because require option adds the exported dependencies anyway
    s.push(null);

    let stream = browserify(s, {
        require: 'tape',
        debug: false,
    }).bundle();
    stream = stream.on('error', onError);
    stream = stream.pipe(vinylSourceStream('tapeImporter.js'));
    stream = stream.pipe(vinylBuffer());
    stream = stream.on('error', onError);
    stream = babelModern(stream);
    stream = stream.pipe(gulp.dest(p.testBrowser));

    return stream;
});

gulp.task('build-browser-js-tests', () => {
    return jsBuild({
        src: `${p.testSrc}/tests.js`,
        format: 'iife',
        minify: false,
        filename: 'tests.js',
        dest: p.testBrowser,
    });
});

gulp.task('build-browser-html', () => {
    let stream = gulp.src(`${p.testSrc}/index.html`);
    stream = stream.pipe(gulp.dest(p.testBrowser));
    return stream;
});

gulp.task('build-browser', gulp.parallel('build-browser-js-tape', 'build-browser-js-tests', 'build-browser-html'));

gulp.task('test-serve', () => {
    browserSync.init({
        files: [`${p.testBrowser}/**/*`],
        reloadDebounce: 1000,
        port: 4000,
        ui: {
            port: 5001,
        },
        server: {
            baseDir: p.testBrowser,
        },
        ghostMode: false,
        snippetOptions: {
            rule: {
                match: /(?:<\/body>)|$/i,
                fn: (snippet, match) => {
                    return '\n\n' + snippet + match;
                },
            },
        },
    });

    gulp.watch(`${p.src}/**/*.*`, gulp.series('build-browser')).on('change', browserSync.reload);
});

gulp.task('test-browser', gulp.series(
    'clear-browser',
    'build-browser',
    'test-serve',
));




gulp.task('clear-node', () => {
    return del([p.testNode]);
});

gulp.task('build-node-js', () => {
    let stream = gulp.src([
        `${p.src}/**/*.js`,
        `!${p.testSrc}/tests.js`, // Don't need a specific start file to import all the other tests for node, unlike the Browser
    ]);
    stream = babelNodePassthrough(stream);
    stream = stream.pipe(gulp.dest(p.testNode));
    return stream;
});

gulp.task('test-node', () => {
    return gulp.src(`${p.testNode}/tests/FeatureTests/*.js`)
        .pipe(gulpTape({
            bail: true,
            nyc: true,
        }))
        .on('error', onError);
});

gulp.task('test', gulp.series(
    'clear-node',
    'build-node-js',
    'test-node',
    'clear-node'
));



gulp.task('clear-compression', () => {
    return del([p.compression]);
});

gulp.task('compress-gzip', () => {
    return genCompression((stream) => {
        return stream.pipe(gulpGzip({
            extension: 'zip',
        }));
    });
});

gulp.task('compress-zopfli', () => {
    return genCompression((stream) => {
        return stream.pipe(gulpZopfliGreen());
    });
});

gulp.task('compress-brotli', () => {
    return genCompression((stream) => {
        return stream.pipe(gulpBrotli.compress());
    });
});

gulp.task('compress-calculate', (end) => {
    const onEnd = (manifest) => {
        const extensionToCompression = {
            js: 'base',
            zip: 'gzip',
            gz: 'zopfli',
            br: 'brotli',
        };

        // Convert data to usable form
        const types = {};
        Object.keys(manifest).forEach((file) => {
            const type = file.replace(/^[^.]+\.|\.min.+$/g, '');
            types[type] = types[type] || {};

            types[type][extensionToCompression[file.match(/\.(.{1,4})$/)[1]]] = manifest[file];
        });

        // Convert data to displayable form
        const esmBaseSize = types.esm.base;
        const cjsBaseSize = types.cjs.base;

        const table = `
| Compression | ES Module  | CommonJS |
|-------------|------------|----------|
| Minified    | ${esmBaseSize} bytes | ${cjsBaseSize} bytes |
| gzip        | ${types.esm.gzip} bytes | ${types.cjs.gzip} bytes |
| zopfli      | ${types.esm.zopfli} bytes | ${types.cjs.zopfli} bytes |
| brotli      | ${types.esm.brotli} bytes | ${types.cjs.brotli} bytes |
`;

        console.log(table); // eslint-disable-line no-console

        end();
    };

    fs.readdir(p.compression, (err, files) => {
        let fileCount = files.length;

        const manifest = {};

        files.forEach((file) => {
            fs.stat(path.join(p.compression, file), (err, stats) => {
                manifest[file] = stats.size;
                fileCount -= 1;

                if (fileCount === 0) {
                    onEnd(manifest);
                }
            });
        });
    });
});

gulp.task('compression-report', gulp.series(
    'clear-compression',
    gulp.parallel('compress-gzip', 'compress-zopfli', 'compress-brotli'),
    'compress-calculate',
    'clear-compression'
));



gulp.task('clear-dist', () => {
    return del([`${p.dist}/**/*`]);
});

gulp.task('prod-esm', () => {
    return jsBuild({
        src: `${p.src}/main.js`,
        filename: 'json_complete.esm.js',
        format: 'esm',
        unminify: true,
        minify: true,
        dest: p.dist,
    });
});

gulp.task('prod-cjs', () => {
    return jsBuild({
        src: `${p.src}/main.js`,
        filename: 'json_complete.cjs.js',
        format: 'cjs',
        unminify: true,
        minify: true,
        dest: p.dist,
    });
});

gulp.task('prod', gulp.series(
    'clear-dist',
    gulp.parallel('prod-esm', 'prod-cjs'),
));

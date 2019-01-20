'use strict';

const path = require('path');
const fs = require('fs-extra');
const utils = require('../../lib/server-utils');
const {FAIL} = require('../../lib/constants/test-statuses');

describe('server-utils', () => {
    const mkTestStub = (test = {}) => {
        return Object.assign({
            imageDir: 'some/dir',
            browserId: 'bro',
            attempt: 2,
            getDiffBounds: () => ({}),
            getRefImg: () => ({}),
            getCurrImg: () => ({}),
            getErrImg: () => ({})
        }, test);
    };

    [
        {name: 'Reference', prefix: 'ref'},
        {name: 'Current', prefix: 'current'},
        {name: 'Diff', prefix: 'diff'}
    ].forEach((testData) => {
        describe(`get${testData.name}Path`, () => {
            it('should generate correct reference path for test image', () => {
                const test = {
                    imageDir: 'some/dir',
                    browserId: 'bro',
                    attempt: 2
                };

                const resultPath = utils[`get${testData.name}Path`](test);

                assert.equal(resultPath, path.join('images', 'some', 'dir', `bro~${testData.prefix}_2.png`));
            });

            it('should add default attempt if it does not exist from test', () => {
                const test = {
                    imageDir: 'some/dir',
                    browserId: 'bro'
                };

                const resultPath = utils[`get${testData.name}Path`](test);

                assert.equal(resultPath, path.join('images', 'some', 'dir', `bro~${testData.prefix}_0.png`));
            });

            it('should add state name to the path if it was passed', () => {
                const test = {
                    imageDir: 'some/dir',
                    browserId: 'bro'
                };

                const resultPath = utils[`get${testData.name}Path`](test, 'plain');

                assert.equal(resultPath, path.join('images', 'some', 'dir', `plain/bro~${testData.prefix}_0.png`));
            });
        });

        describe(`get${testData.name}AbsolutePath`, () => {
            const sandbox = sinon.sandbox.create();

            beforeEach(() => {
                sandbox.stub(process, 'cwd').returns('/root');
            });

            afterEach(() => sandbox.restore());

            it('should generate correct absolute path for test image', () => {
                const test = {
                    imageDir: 'some/dir',
                    browserId: 'bro'
                };

                const resultPath = utils[`get${testData.name}AbsolutePath`](test, 'reportPath');

                assert.equal(resultPath, path.join('/root', 'reportPath', 'images', 'some', 'dir', `bro~${testData.prefix}_0.png`));
            });

            it('should add state name to the path if it was passed', () => {
                const test = {
                    imageDir: 'some/dir',
                    browserId: 'bro'
                };

                const resultPath = utils[`get${testData.name}AbsolutePath`](test, 'reportPath', 'plain');

                assert.equal(resultPath, path.join('/root', 'reportPath', 'images', 'some', 'dir', 'plain', `bro~${testData.prefix}_0.png`));
            });
        });
    });

    describe('prepareCommonJSData', () => {
        const sandbox = sinon.sandbox.create();

        afterEach(() => sandbox.restore());

        it('should wrap passed data with commonjs wrapper', () => {
            const result = utils.prepareCommonJSData({some: 'data'});

            const expectedData = 'var data = {"some":"data"};\n'
                + 'try { module.exports = data; } catch(e) {}';

            assert.equal(result, expectedData);
        });

        it('should stringify passed data', () => {
            sandbox.stub(JSON, 'stringify');

            utils.prepareCommonJSData({some: 'data'});

            assert.calledOnceWith(JSON.stringify, {some: 'data'});
        });
    });

    describe('copyImageAsync', () => {
        const sandbox = sinon.sandbox.create();

        beforeEach(() => {
            sandbox.stub(fs, 'copyAsync').resolves();
            sandbox.stub(fs, 'mkdirsAsync').resolves();
        });

        afterEach(() => sandbox.restore());

        it('should create directory and copy image', () => {
            const fromPath = '/from/image.png',
                toPath = '/to/image.png';

            return utils.copyImageAsync(fromPath, toPath)
                .then(() => {
                    assert.calledWithMatch(fs.mkdirsAsync, '/to');
                    assert.calledWithMatch(fs.copyAsync, fromPath, toPath);
                });
        });
    });

    describe('getImagesFor', () => {
        it('should return diff with diff bounds', () => {
            const test = mkTestStub({
                getDiffBounds: () => ({left: 0, top: 0, right: 10, bottom: 10})
            });

            const images = utils.getImagesFor(FAIL, test);

            assert.match(images.diffImg, {diffBounds: {left: 0, top: 0, right: 10, bottom: 10}});
        });
    });
});

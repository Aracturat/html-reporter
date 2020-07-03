'use strict';

const defaults = require('../../constants/defaults');
const viewModes = require('../../constants/view-modes');

export default Object.assign(defaults, {
    gui: true,
    running: false,
    processing: false,
    autoRun: false,
    skips: [],
    browsers: [],
    groupedErrors: [],
    suites: {},
    suiteIds: {
        all: [],
        failed: []
    },
    suites2: {
        byId: {},
        allRootIds: [],
        failedRootIds: [],
        allIds: [],
        failedIds: []
    },
    tests: {
        byId: {},
        allRootIds: [],
        failedRootIds: [],
        allIds: [],
        failedIds: []
    },
    results: {
        byId: {},
        allIds: [],
        failedIds: []
    },
    imagesInfo: {
        byId: {},
        allIds: [],
        failedIds: []
    },
    closeIds: [],
    apiValues: {
        extraItems: {},
        metaInfoExtenders: {}
    },
    loading: {},
    modal: {},
    stats: {
        total: 0,
        updated: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        retries: 0,
        warned: 0
    },
    view: {
        viewMode: viewModes.ALL,
        expand: 'errors',
        showSkipped: false,
        showOnlyDiff: false,
        scaleImages: false,
        baseHost: '',
        testNameFilter: '',
        strictMatchFilter: false,
        filteredBrowsers: [],
        groupByError: false
    },
    db: undefined,
    fetchDbDetails: undefined
});

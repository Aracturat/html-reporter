import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
// import LazilyRender from '@gemini-testing/react-lazily-render';
import {List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller} from 'react-virtualized';
import SectionWrapper from './section-wrapper';
import SectionBrowser from './section-browser';
import {isFailStatus, isErroredStatus} from '../../../common-utils';
import Title from './title/simple';
import {mkShouldSuiteBeShown, mkHasSuiteFailedRetries} from '../../modules/selectors/tree';

class SectionCommon extends Component {
    static propTypes = {
        suiteId: PropTypes.string.isRequired,
        eventToUpdate: PropTypes.string,
        eventToReset: PropTypes.string,
        errorGroupBrowserIds: PropTypes.array,
        sectionRoot: PropTypes.bool.isRequired,
        // from store
        expand: PropTypes.string.isRequired,
        suiteName: PropTypes.string.isRequired,
        suiteStatus: PropTypes.string.isRequired,
        suiteChildIds: PropTypes.array,
        suiteBrowserIds: PropTypes.array,
        shouldBeShown: PropTypes.bool.isRequired,
        hasFailedRetries: PropTypes.bool.isRequired,
        // from SectionCommonWrapper
        shouldBeOpened: PropTypes.func.isRequired,
        sectionStatusResolver: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        // this._lazyRender = React.createRef();
    }

    state = {
        opened: this.props.shouldBeOpened(this._getStates())
    }

    // suiteCache = new CellMeasurerCache({
    //     fixedWidth: true,
    //     // fixedHeight: false,
    //     defaultHeight: 250
    // });

    // browserCache = new CellMeasurerCache({
    //     fixedWidth: true,
    //     // fixedHeight: false,
    //     defaultHeight: 170
    //     // minHeight: 30
    //     // defaultHeight: 25
    // });

    // eslint-disable-next-line camelcase
    // UNSAFE_componentWillReceiveProps(nextProps) {
    //     console.log('nextProps:', nextProps);
    //     console.log('this.props:', this.props);

    //     const updatedStates = this._getStates(nextProps);
    //     this.setState({opened: this.props.shouldBeOpened(updatedStates)});
    // }

    _getStates(props = this.props) {
        const {suiteStatus, expand, hasFailedRetries} = props;

        return {
            failed: isFailStatus(suiteStatus) || isErroredStatus(suiteStatus),
            retried: hasFailedRetries,
            expand
        };
    }

    _onToggleSection = () => {
        this.setState({opened: !this.state.opened}, () => {
            this.props.clearCacheHandler();
        });
        const {eventToUpdate} = this.props;

        if (eventToUpdate) {
            window.dispatchEvent(new Event(eventToUpdate));
        }
    }

    renderSuitesRow = ({index, key, style, parent}) => {
        const {suiteChildIds, mainWidth, mainHeight} = this.props;
        const suiteId = suiteChildIds[index];

        return (
            <CellMeasurer
                key={key}
                cache={this.suiteCache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                <div key={key} style={style} className="suite_row">
                    <SectionCommonWrapper
                        key={suiteId}
                        suiteId={suiteId}
                        eventToUpdate={this.props.eventToUpdate}
                        eventToReset={this.props.eventToReset}
                        sectionRoot={false}
                        mainWidth={mainWidth}
                        mainHeight={mainHeight}
                        // errorGroupBrowserIds={errorGroupBrowserIds}
                        clearCacheHandler={this.props.clearCacheHandler}
                    />
                </div>
            </CellMeasurer>
        );
    }

    renderBrowserRow = ({index, key, style, parent}) => {
        const {suiteBrowserIds} = this.props;
        const browserId = suiteBrowserIds[index];

        return (
            <CellMeasurer
                key={key}
                cache={this.browserCache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                <div key={key} style={style} className="browser_row">
                    <SectionBrowser key={browserId} browserId={browserId} />
                </div>
            </CellMeasurer>
        );
    }

    _drawSection() {
        // console.log('DRAW COMPONENT:', this.props.suiteId);

        const {
            suiteId,
            suiteName,
            suiteStatus,
            suiteChildIds,
            suiteBrowserIds,
            // errorGroupBrowserIds,
            sectionRoot,
            sectionStatusResolver,
            mainWidth,
            mainHeight
        } = this.props;
        const {opened} = this.state;

        if (!opened) {
            return (
                <div className={sectionStatusResolver({status: suiteStatus, opened, sectionRoot})}>
                    <Title name={suiteName} suiteId={suiteId} handler={this._onToggleSection} />
                </div>
            );
        }

        // let childSuitesTmpl = null;

        // if (suiteChildIds) {
        //     childSuitesTmpl = <List
        //         autoHeight
        //         height={mainHeight}
        //         width={mainWidth}
        //         deferredMeasurementCache={this.suiteCache}
        //         rowHeight={this.suiteCache.rowHeight}
        //         rowCount={suiteChildIds.length}
        //         rowRenderer={this.renderSuitesRow}
        //         overscanRowCount={0}
        //         style={{outline: 'none'}}
        //     />;
        // }

        const childSuitesTmpl = suiteChildIds && suiteChildIds.map((suiteId) => {
            return <SectionCommonWrapper
                key={suiteId}
                suiteId={suiteId}
                eventToUpdate={this.props.eventToUpdate}
                eventToReset={this.props.eventToReset}
                sectionRoot={false}
                mainWidth={mainWidth}
                mainHeight={mainHeight}
                // errorGroupBrowserIds={errorGroupBrowserIds}
                clearCacheHandler={this.props.clearCacheHandler}
            />;
        });

        // let browsersTmpl = null;

        // if (suiteBrowserIds) {
        //     browsersTmpl = <List
        //         autoHeight
        //         height={mainHeight}
        //         width={mainWidth}
        //         deferredMeasurementCache={this.browserCache}
        //         rowHeight={this.browserCache.rowHeight}
        //         rowCount={suiteBrowserIds.length}
        //         rowRenderer={this.renderBrowserRow}
        //         overscanRowCount={0}
        //         style={{outline: 'none'}}
        //     />;
        // }

        const browsersTmpl = suiteBrowserIds && suiteBrowserIds.map((browserId) => {
            // return <SectionBrowser key={browserId} browserId={browserId} errorGroupBrowserIds={errorGroupBrowserIds} />;
            return <SectionBrowser key={browserId} browserId={browserId} />;
        });

        return (
            <div className={sectionStatusResolver({status: suiteStatus, opened, sectionRoot})}>
                <Title name={suiteName} suiteId={suiteId} handler={this._onToggleSection} />
                <div className="section__body">
                    {childSuitesTmpl}
                    {browsersTmpl}
                </div>
            </div>
        );
    }

    // _drawLazySection() {
    //     const {suiteId, eventToUpdate, eventToReset, lazyLoadOffset} = this.props;

    //     return <LazilyRender key={suiteId} eventToUpdate={eventToUpdate} eventToReset={eventToReset} offset={lazyLoadOffset}>
    //         {render => render ? this._drawSection() : null}
    //     </LazilyRender>;
    // }

    render() {
        if (!this.props.shouldBeShown) {
            return null;
        }

        return this._drawSection();

        // return this.props.lazyLoadOffset > 0
        //     ? this._drawLazySection()
        //     : this._drawSection();
    }
}

const SectionCommonWrapper = connect(
    () => {
        const shouldSuiteBeShown = mkShouldSuiteBeShown();
        const hasSuiteFailedRetries = mkHasSuiteFailedRetries();

        return (state, {suiteId, errorGroupBrowserIds, sectionRoot}) => {
            const suite = state.tree.suites.byId[suiteId];
            const shouldBeShown = sectionRoot ? true : shouldSuiteBeShown(state, {suiteId});
            let hasFailedRetries = false;

            if (shouldBeShown) {
                hasFailedRetries = hasSuiteFailedRetries(state, {suiteId});
            }

            return {
                expand: state.view.expand,
                lazyLoadOffset: state.view.lazyLoadOffset,
                suiteName: suite.name,
                suiteStatus: suite.status,
                suiteChildIds: suite.suiteIds,
                suiteBrowserIds: suite.browserIds,
                shouldBeShown,
                hasFailedRetries
            };
        };
    },
)(SectionWrapper(SectionCommon));

export default SectionCommonWrapper;

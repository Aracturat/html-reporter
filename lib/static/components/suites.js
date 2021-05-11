import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller} from 'react-virtualized';

import SectionCommon from './section/section-common';
import clientEvents from '../../gui/constants/client-events';
import {mkGetVisibleRootSuiteIds} from '../modules/selectors/tree';

class Suites extends Component {
    static propTypes = {
        errorGroupBrowserIds: PropTypes.array,
        // from store
        visibleRootSuiteIds: PropTypes.arrayOf(PropTypes.string),
        lazyLoadOffset: PropTypes.number
    }

    cache = new CellMeasurerCache({
        fixedWidth: true,
        fixedHeight: false,
        defaultHeight: 250
        // minHeight: 30
        // defaultHeight: 25
    });

    renderRow = (width, height) => ({index, key, style, parent}) => {
        const {visibleRootSuiteIds, errorGroupBrowserIds, lazyLoadOffset} = this.props;
        const suiteId = visibleRootSuiteIds[index];
        const sectionProps = {
            key: suiteId,
            suiteId: suiteId,
            // errorGroupBrowserIds,
            sectionRoot: true,
            mainWidth: width,
            mainHeight: height
            // clearCacheHandler: () => {
            //     console.log('clear cache with index:', index);
            //     this.cache.clear(index);
            // }
        };

        if (lazyLoadOffset > 0) {
            sectionProps.eventToUpdate = clientEvents.VIEW_CHANGED;
            sectionProps.eventToReset = clientEvents.SUITES_VISIBILITY_CHANGED;
        }

        return (
            <CellMeasurer
                key={key}
                cache={this.cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                {({measure}) => (
                    <div key={key} style={style} className="row">
                        <SectionCommon {...sectionProps} clearCacheHandler={measure} />
                    </div>
                )}
            </CellMeasurer>
        );

        // return <SectionCommon key={key} style={style} {...sectionProps} />;
    }

    render() {
        const {visibleRootSuiteIds, errorGroupBrowserIds, lazyLoadOffset} = this.props;

        return (
            <div className="sections">
                <WindowScroller>
                    {({height, isScrolling, onChildScroll, scrollTop}) => (
                        <AutoSizer disableHeight>
                            {({width}) => (
                                // <div ref={el => registerChild(el)}>
                                <List
                                    autoHeight
                                    height={height}
                                    width={width}
                                    isScrolling={isScrolling}
                                    onScroll={onChildScroll}
                                    scrollTop={scrollTop}
                                    deferredMeasurementCache={this.cache}
                                    rowHeight={this.cache.rowHeight}
                                    rowCount={visibleRootSuiteIds.length}
                                    rowRenderer={this.renderRow(width, height)}
                                    overscanRowCount={0}
                                    style={{outline: 'none'}}
                                />
                                // </div>
                            )}
                        </AutoSizer>
                    )}
                </WindowScroller>
            </div>
        );
    }
}

export default connect(
    () => {
        const getVisibleRootSuiteIds = mkGetVisibleRootSuiteIds();

        return (state, {errorGroupBrowserIds}) => ({
            lazyLoadOffset: state.view.lazyLoadOffset,
            visibleRootSuiteIds: getVisibleRootSuiteIds(state, {errorGroupBrowserIds})
        });
    }
)(Suites);

// {
//     visibleRootSuiteIds.map((suiteId) => {
//         const sectionProps = {
//             key: suiteId,
//             suiteId: suiteId,
//             errorGroupBrowserIds,
//             sectionRoot: true
//         };

//         if (lazyLoadOffset > 0) {
//             sectionProps.eventToUpdate = clientEvents.VIEW_CHANGED;
//             sectionProps.eventToReset = clientEvents.SUITES_VISIBILITY_CHANGED;
//         }

//         return <SectionCommon {...sectionProps} />;
//     })
// }

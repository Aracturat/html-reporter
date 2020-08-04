import React from 'react';
import proxyquire from 'proxyquire';
import {defaults} from 'lodash';

describe('<RetrySwitcher >', () => {
    const sandbox = sinon.sandbox.create();
    let RetrySwitcher, RetrySwitcherItem;

    const mkRetrySwitcher = (props = {}) => {
        props = defaults(props, {
            resultIds: ['default-id'],
            retryIndex: 0,
            onChange: sinon.stub()
        });

        return mount(<RetrySwitcher {...props} />);
    };

    beforeEach(() => {
        RetrySwitcherItem = sinon.stub().returns(null);

        RetrySwitcher = proxyquire('lib/static/components/section/body/retry-switcher', {
            './item': {default: RetrySwitcherItem}
        }).default;
    });

    afterEach(() => sandbox.restore());

    it('should not render any tab switcher button if test did not retry', () => {
        mkRetrySwitcher({resultIds: ['result-1']});

        assert.notCalled(RetrySwitcherItem);
    });

    it('should create tab switcher buttons for each result', () => {
        mkRetrySwitcher({resultIds: ['result-1', 'result-2'], retryIndex: 1});

        assert.calledTwice(RetrySwitcherItem);
        assert.calledWith(
            RetrySwitcherItem.firstCall,
            {children: 1, resultId: 'result-1', isActive: false, onClick: sinon.match.func}
        );
        assert.calledWith(
            RetrySwitcherItem.secondCall,
            {children: 2, resultId: 'result-2', isActive: true, onClick: sinon.match.func}
        );
    });

    it('should call "onChange" prop on call passed "onClick" prop', () => {
        const onChange = sinon.stub();
        mkRetrySwitcher({resultIds: ['result-1', 'result-2'], onChange});

        RetrySwitcherItem.secondCall.args[0].onClick();

        assert.calledOnceWith(onChange, 1);
    });
});

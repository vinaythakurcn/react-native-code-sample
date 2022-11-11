import * as React from 'react'
import renderer from 'react-test-renderer'
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

import { NoInternetModalComp, NoInternetModalArgs } from '../__stories__/NoInternetModal.stories'
import mockStore from '../../../.storybook/mockStore';

jest.useFakeTimers()

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);



describe('NoInternetModal test', () => {
    test('render correctly', () => {
        const tree = renderer
            .create(mockStore(NoInternetModalComp()))
            .toJSON()
        expect(tree).toMatchSnapshot()
    })

    test("Verifying Props", () => {
        const expectedProps = {
            ...NoInternetModalArgs,
        }

        const tree = renderer.create(mockStore(NoInternetModalComp(expectedProps)))
        const {
            root: { props },
        } = tree
        expect(props.message).toStrictEqual(expectedProps.message)
    });


    test('check for no internet message showing', () => {
        const { queryByTestId} = render(mockStore(NoInternetModalComp({})));
        const loadingCompWithIsFullScreenFalse = queryByTestId('test-nointernet-text')
        expect(loadingCompWithIsFullScreenFalse).toBeTruthy()
    })

    test('check for updated text on component when message = custom message', () => {
        const props = {
            message: 'custom message'
        }
        const { queryByTestId } = render(mockStore(NoInternetModalComp(props)));
        const loadingText = queryByTestId('test-nointernet-text')
        expect(loadingText?.children[0]).toEqual('custom message')
    })
})
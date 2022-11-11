import * as React from 'react'
import { storiesOf } from '@storybook/react-native'
import { boolean } from '@storybook/addon-knobs';

import NoInternetModal, { INoInternetModal } from '..'
import CenterView from '../../../../storybook/stories/CenterView'
import mockStore from '../../../.storybook/mockStore';

export const NoInternetModalArgs: INoInternetModal = {
    visible: true,
}

export const NoInternetModalComp = (props = {}) => <NoInternetModal {...NoInternetModalArgs} {...props} />

storiesOf('NoInternetModal', module)
    .addDecorator((story) => <CenterView>{story()}</CenterView>)
    .add('default', () => mockStore(<NoInternetModal visible={boolean('visible', true)} />))

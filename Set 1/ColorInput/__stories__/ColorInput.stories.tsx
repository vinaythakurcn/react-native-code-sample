import * as React from 'react'
import { storiesOf } from '@storybook/react-native'
import { text, boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'

import ColorInput from '../'
import CenterView from '../../../../../storybook/stories/CenterView'

storiesOf('ColorInput', module)
    .addDecorator((story) => <CenterView>{story()}</CenterView>)
    .add('default', () => (
        <ColorInput
            value={text('value', '#FF0000')}
            onChange={action('clicked-text')}
            label={text('label', '')}
            icon={text('icon', '')}
            disabled={boolean('disabled', false)}
        />
    ))

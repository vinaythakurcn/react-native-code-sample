import * as React from 'react'
import { render } from '@testing-library/react-native';
import renderer from 'react-test-renderer'
import ColorInput, {IColorInput} from '../'

const defaultProps: IColorInput = {
    value: '#FF0000',
    onChange: () => {},
}

const setup = (props = {}) => <ColorInput {...defaultProps} {...props} />

describe('<ColorInput />', () => {
    test('Exported correctly', () => {
        expect(setup()).toBeDefined()
    })

    test('Render without failed ', () => {
        const tree = renderer.create(setup()).toJSON()
        expect(tree).toMatchSnapshot()
    })

    test('Verifying props ', () => {
        const tree = renderer.create(setup())
        const {
            root: { props: renderedProp },
        } = tree
        expect(renderedProp.value).toStrictEqual(defaultProps.value)

    })

    test('should exists label when passed ', () => {
        const { queryByText } = render(setup({label: 'some label'}));
        const labelField = queryByText('some label')
        expect(labelField).toBeTruthy()

    })
})

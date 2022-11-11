import React from 'react'
import styled from 'styled-components/native'
import { ViewStyle } from 'react-native'

import Colors from '../../../theme/colors'

export interface INumberInputProps {
    onError?: (msg: string) => void
    onChange: (phoneNumber: string) => void
    onBlur?: (...args: any[]) => void
    value?: string | null
    readOnly?: boolean | null | undefined
    style?: ViewStyle | null
    placeholder?: string
    protocol?: string | undefined
    // isManual?: boolean
}
const URLStyledField = styled.TextInput<{ [key: string]: unknown }>`
    flex: 1;
    padding: 0 12px;
    height: 100%;
    color: ${Colors.shadowGray};
    ${({editable}) => !editable ? `background-color: ${Colors.disabledColor};` : `background-color: ${Colors.white};`}
    border-radius: 0;
    font-size: 16px;
    font-weight: 500;
`

const URLField: React.FC<any> = (props) => {
    const { style, readOnly, placeholder = 'www.example.com', onChange, value, protocol } = props

    const handleChange = React.useCallback((changedURL: any) => onChange(changedURL), [onChange, protocol])

    return (
        <URLStyledField
            testID='url-input-test'
            placeholder={placeholder}
            placeholderTextColor={Colors.placeholderColor}
            onChangeText={handleChange}
            editable={!readOnly}
            value={value}
            autoCapitalize={'none'}
            autoCorrect={false}
        />
    )
}

export default React.memo(URLField)

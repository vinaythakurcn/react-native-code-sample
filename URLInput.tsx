import React from 'react'
import styled from 'styled-components/native'
import { ViewStyle, Linking } from 'react-native'
import _ from 'lodash'

import Text from '../../Text'
import URLField from './URLField'
import Icon from '../../Icon'
import Colors from '../../../theme/colors'
import URLProtocolModal from './URLProtocolModal'

const StyledInputWrapper = styled.View<{readOnly: boolean}>`
    flex-direction: row;
    justify-content: space-between;
    height: 40px;
    width: 100%;
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: ${Colors.shadowGray};
    ${({readOnly}) => readOnly ? `background-color: ${Colors.disabledColor};` : `background-color: ${Colors.white};`}
    box-shadow: none;
    border-radius: 5px;
    border: 1px solid ${Colors.mediumGray};
`
const StyledProtocolWrapper = styled.TouchableOpacity`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100px;
    padding: 0 8px;
`
const StyledVerticalLine = styled.View`
    height: 70%;
    width: 1px;
    background-color: ${Colors.mediumGray};
    align-self: center;
`
const StyledDialIcon = styled.TouchableOpacity`
    padding: 6px 12px;
    justify-content: center;
    font-weight: 500;
    background-color: ${Colors.orange};
    color: ${Colors.white};
    height: 100%;
    border: none;
`

export interface IURLInputProps {
    /** The props for the input field (see FormInput). */
    onChange: (value: string) => void
    /** A flag that signifies whether the input field is editable. */
    readOnly?: boolean
    /** Pass Error */
    onError: (message: string) => void
    /** Pass value to phone number input*/
    value?: string | null
    /* The protocols the user can choose from.
     * This defaults to `['https://', 'http://']`
     */
    // protocols: PropTypes.arrayOf(PropTypes.string),
    protocols?: string[]
    /**
     * A text that is shown on the input if no value has been entered.
     * If undefined, this will default to 'www.example.com'.
     */
    placeholder?: string
    /** pass custom style to input */
    style?: ViewStyle
}

const URLInput: React.FC<IURLInputProps> = (props) => {
    const { value: propsValue, protocols, placeholder, onChange, readOnly, onError, style, ...restProps } = props

    const [protocol, setProtocol] = React.useState(protocols?.[0] || '')
    const [openDropdown, setOpenDropdown] = React.useState(false)
    const [value, setValue] = React.useState(propsValue)
    const [inputValue, setInputValue] = React.useState<string>('')

    React.useEffect(() => {
        // if(isNil(propsValue)){
        setValue(propsValue)
        // }
    }, [propsValue])

    const checkMatcingProtocol = (text) => {
        const mathches = protocols?.filter((e) => text.indexOf(e) !== -1)
        return mathches && mathches.length > 0 ? true : false
    }

    const onChangeHandler = React.useCallback(
        (val: string) => {
            const protocolPart = val.split('://')[0]
            let updatedValue = ''
            if (val.length > 4) {
                // check after 4 characters
                if (checkMatcingProtocol(val)) {
                    // check if user is typing a valid protocol
                    if (val.indexOf('://') > 0) {
                        // check if user has typed a protocol
                        if (!protocols?.includes(protocolPart + '://')) {
                            onError('Error: Invalid Protocol')
                        } else {
                            // valid protocol
                            updatedValue = val.replace(protocolPart + '://', '')
                            setInputValue(updatedValue)
                            setValue(protocolPart + '://' + updatedValue)
                            setProtocol(protocolPart + '://')
                            onChange(protocolPart + '://' + updatedValue)
                        }
                    } else {
                        setInputValue(val)
                        setValue(protocol + val)
                        onChange(protocol + val)
                    }
                } else {
                    if (val.indexOf('://') > 0) {
                        if (!protocols?.includes(protocolPart + '://')) {
                            onError('Error: Invalid Protocol')
                            setInputValue(val)
                            setValue(val)
                            onChange(val)
                        } else {
                            setInputValue(val)
                            setProtocol(protocolPart + '://')
                            setValue(protocol + val)
                            onChange(protocol + val)
                        }
                    } else {
                        // append default protocol
                        setInputValue(val)
                        setValue((protocol ? protocol : 'https://') + val)
                        onChange((protocol ? protocol : 'https://') + val)
                        !protocol && setProtocol('https://')
                    }
                }
            } else {
                //check before 4 characters
                setInputValue(val)
                setValue(val ? protocol + val : '')
                onChange(val ? protocol + val : '')
                const urlParts = val.split('://')
                if (val.indexOf('://') > 0 && protocols?.includes(urlParts[0] + '://')) {
                    setProtocol(urlParts[0] + '://')
                    updatedValue = val.replace(protocolPart + '://', '')
                    setInputValue(updatedValue)
                }
            }
        },
        [protocol, value, onChange]
    )

    const openURL = React.useCallback(() => {
        let urlToOpen: string = value || ''
        const urlParts = value?.split('://')
        if (value && value.indexOf('://') > 0) {
            urlToOpen = value
            if (!protocols?.includes(urlParts?.[0] + '://')) {
                onError('Error: Invalid Protocol')
                return
            }
        } else {
            if (protocol) {
                urlToOpen = protocol + value?.replace('://', '')
            } else {
                onError('Error : Invalid URL')
                return
            }
        }
        const expression =
            /((https?|ftp):\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
        const expressionRegex = new RegExp(expression)
        if (expressionRegex.test(urlToOpen)) {
            Linking.openURL(urlToOpen)
        } else {
            onError('Error : Invalid URL')
        }
    }, [value, protocols, onError, protocol])

    const onSelectChangeHandler = React.useCallback(
        (val: string) => {
            setProtocol(val)
            const urlParts = value?.split('://')
            if (value && value.indexOf('://') > 0 && protocols?.includes(urlParts?.[0] + '://')) {
                setValue(val + urlParts?.[1])
                onChange(val + urlParts?.[1])
            }
        },
        [value, onChange]
    )

    return (
        <>
            <StyledInputWrapper readOnly={!!readOnly}>
                <StyledProtocolWrapper onPress={() => setOpenDropdown(true)} disabled={readOnly}>
                    <Text>{protocol}</Text>
                    {!readOnly && <Icon name='arrow_drop_down' size={24} color={Colors.darkGray} />}
                    <StyledVerticalLine />
                </StyledProtocolWrapper>

                <URLField
                    {...props}
                    protocol={protocol}
                    onChange={onChangeHandler}
                    value={inputValue}
                    readOnly={readOnly}
                    placeholder={placeholder}
                />
                <StyledDialIcon
                    testID='dial-view'
                    style={{ borderTopRightRadius: 5, borderBottomRightRadius: 5 }}
                    onPress={openURL}
                >
                    <Icon name='language' color={Colors.white} size={24} style={{}} />
                </StyledDialIcon>
            </StyledInputWrapper>
            <URLProtocolModal
                isOpen={openDropdown}
                onClose={() => setOpenDropdown(false)}
                onChange={onSelectChangeHandler}
                protocols={protocols || []}
                selectedProtocol={protocol}
            />
        </>
    )
}

URLInput.defaultProps = {
    readOnly: false,
    protocols: ['https://', 'http://'],
    placeholder: 'www.example.com',
}

export default URLInput

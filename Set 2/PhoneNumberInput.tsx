import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components/native'
import { Dimensions, View, ViewStyle, Image, Linking, ViewComponent, TouchableOpacity, ClipboardStatic } from 'react-native'
import PhoneNumberField from './PhoneNumberField'
import Icon from '../../Icon'
import { Flag } from 'react-native-svg-flagkit'
import countries from './utils/countries'

import { IChoice } from '../SelectDropdown/types'
import DropdownCountry from './DropdownCountry'
import _ from "lodash";
import { findDialCodePhoneNumber, findDialCodeWithCountryCode } from './utils'
import parsePhoneNumber, { isValidPhoneNumber ,validatePhoneNumberLength } from 'libphonenumber-js/max'

import { ICountry } from './types'
import Colors from '../../../theme/colors'
const { width: W, height: H } = Dimensions.get("window")

const DefaultFlagIcon = require('./assets/images/international-icon-3x2.png')
const ic_down = require("./assets/images/down.png");

/**
 * A object helps to display phone number type icon.
 * value is icon name and key is phone number type
 */
 const PHONE_NUMBER_TYPE_ICON_LIST = {
    TOLL_FREE: 'support_agent',
    MOBILE: 'phone_iphone',
    FIXED_LINE: 'call_end',
    PREMIUM_RATE: 'request_quote',
    SHARED_COST: 'device_hub',
    VOIP: 'voice_chat',
    PERSONAL_NUMBERS: 'contact_phone',
    UAN: 'phone',
    PAGER: 'document_scanner',
    VOICEMAIL: 'voicemail',
    FIXED_LINE_OR_MOBILE: 'phone_disabled',
}


const StyledInputWrapper = styled.View`
    flex-direction: row;
    height: 40px;
    width: 100%;
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: ${Colors.shadowGray};
    background-color: ${Colors.white};
    box-shadow: none;
    border-radius: 5px;
    border: 1px solid ${Colors.mediumGray};
`

const StyledFlagContainer = styled.View`
    flex-direction: row;
    height: 40px;
    width: ${W * 0.2}px;
`

const StyledFlagIcon = styled.View`
    padding: 6px 12px;
    justify-content: center;
    font-weight: 500;
    color: ${Colors.black};
    height: 100%;
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

export interface IPhoneNumberInputProps {
    /** The props for the input field (see FormInput). */
    onChange: (value: string) => void
    /** A flag that signifies whether the input field is editable. */
    readOnly?: boolean
    /** This props for whether country name should show or not */
    hideCountryName?: boolean
    /** Pass default country */
    defaultCountry?: string
    /** Pass Error */
    onError?: (message: string) => void
    /** Pass value to phone number input*/
    value?: string | null
    /** Right Decoration components */
    rightDecorationComponents?: ViewComponent | null
    /** pass custom style to input */
    style?: ViewStyle
}

const PhoneNumberInput: React.FC<IPhoneNumberInputProps> = (props) => {
    const { value, onChange, readOnly, hideCountryName, defaultCountry, onError, rightDecorationComponents, style, ...restProps } = props
    
    /** Stores the selected country in the component. */
    const [selectedCountry, setSelectedCountry] = React.useState('')
    /** Stores the code of the country in the component. */
    const [selectedCountryCode, setSelectedCountryCode] = React.useState<string | undefined>('')
    /** this state is used whether user select country manually or not */
    const [selectCountryManual, setSelectCountryManual] = React.useState(false)
    /** State is used to open or close the flag dropdown */
    const [openDropdown, setOpenDropdown] = React.useState(false)
    /** store currentvalue of the input phone number */
    const [currentValue, setCurrentValue] = React.useState<string | null>(value as string)
    /** this state store the type of the phone number e.g TOLL_FREE, MOBILE etc. */
    const [type, setType] = React.useState<string | undefined>(undefined)

    const onChangeCountry = useCallback((item: any) => {
        setSelectedCountry(item.code)
        setSelectedCountryCode(item?.dial_code)
        setSelectCountryManual(true)
    }, [])

    const dialPhoneNumber = useCallback(() => {
        if (currentValue) {
            Linking.openURL(`tel:${currentValue}`)
        }
    }, [currentValue, value])


    const flagIcon = React.useMemo(() => {        
        return (
            <StyledFlagIcon testID='flag-icon-test' style={{ borderTopRightRadius: 5, borderBottomRightRadius: 5, flexDirection: 'row', alignItems: 'center' }}>
                {selectedCountry && selectedCountry !== 'default' ?
                    <View testID='selected-country-test' style={{ alignItems: 'center', maxHeight: 30, overflow: 'hidden' }}>
                        <Flag
                            id={selectedCountry}
                            width={40}
                            height={30}
                        />
                    </View>
                    : <Image testID='default-phone-icon' source={DefaultFlagIcon} style={{ height: 24, width: 24, alignSelf: 'baseline' }} resizeMode="contain" />}
                <TouchableOpacity style={{ marginHorizontal: 12 }} onPress={() => toggleDropdown()} disabled={readOnly}>
                    <Image testID='toggle-dropdown-icon' source={ic_down} style={[{ width: 10, height: 10 }]} />
                </TouchableOpacity>
            </StyledFlagIcon>
        )
    }, [currentValue, openDropdown, selectedCountry, defaultCountry])

    const converInstanceToChoices = (): IChoice[] => {
        return countries?.map(item => {

            return {
                label: `(${item.dial_code}) ${item.name}`,
                value: item.dial_code,
                ...item
            } as IChoice
        })
    }

    const toggleDropdown = useCallback(() => {
        setOpenDropdown(!openDropdown)
    }, [openDropdown])

    const onChangeSelectedCountryCode = (countryCode: string) => {
        let isNumberNotSameAsCountryCode = false
        const findCountry = countries.find((country: ICountry) => country.code == countryCode)
        isNumberNotSameAsCountryCode = findCountry && selectedCountry !== findCountry?.code ? true : false
        if (isNumberNotSameAsCountryCode) {
            setSelectCountryManual(false)
            setSelectedCountry(findCountry?.code as string)
            setSelectedCountryCode(findCountry?.dial_code as string)
        }
    }

    const changeSelectedCountryWithDialCode = (dialCode: string) => {
        const findCountry = countries.find((country: ICountry) => country.dial_code == dialCode)
        if(findCountry && selectedCountry !== findCountry?.code) {
            setSelectCountryManual(false)
            setSelectedCountry(findCountry?.code as string)
            setSelectedCountryCode(findCountry?.dial_code as string)
        }
    }

    /**
     * This func is used to setting country based on parsed phone number or get country payload from countries 
     * @param phoneNumber phone number value in order to get country code and dial code
     * @param dialCodeValue dial code of the phone number
     */
    const settingCountry = (phoneNumber, dialCodeValue) => {
        const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
            if(parsedPhoneNumber) {
                onChangeSelectedCountryCode(parsedPhoneNumber.country as string)
            } else {
                changeSelectedCountryWithDialCode(dialCodeValue?.lastDialCode as string)
            }
    }

    const onInputChange = (phoneNumber: string | null) => {
        setCurrentValue(phoneNumber as string)
        onChange(phoneNumber as string)
        if (phoneNumber?.startsWith('+')) {
            const dialCodeValue = findDialCodePhoneNumber(phoneNumber)
            settingCountry(phoneNumber, dialCodeValue)
        } else if (phoneNumber?.startsWith('00')) {
            const dialCodeValue = findDialCodePhoneNumber(`+${phoneNumber.substring(2)}`)
            settingCountry(phoneNumber, dialCodeValue)
        } else if (!phoneNumber?.startsWith('+') || phoneNumber?.startsWith('00')) {
            setSelectedCountry('default')
        }
    }

    /**
     * This func is used to change the selected country based on countryCode
     * @param countryCode 
     */
    const handleCountryChange = (countryCode: string) => {
        const countryPayload =  findDialCodeWithCountryCode(countryCode)
        setSelectedCountry(countryPayload?.code as string)
        setSelectedCountryCode(countryPayload?.dial_code)
    }

    useEffect(() => {
        const defaultCountryCode = countries.find((country: ICountry) => country.code === defaultCountry)
        setSelectedCountryCode(defaultCountryCode?.dial_code as string)
        setSelectedCountry(defaultCountryCode?.code as string)
    }, [defaultCountry])

    /**
     * This hook will run once and It will set the country code  and selected counrty based on value.
     */
    useEffect(() => {
        if(value) {
            const phoneNumber = parsePhoneNumber(value as string)
            if(phoneNumber) {
                let updatedCode = '';
                let updatedDialCode = '';
                const countryCode = phoneNumber.country
                const foundCountry = findDialCodeWithCountryCode(countryCode ?? defaultCountry as string)
                const { lastCountryCode, lastDialCode } = findDialCodePhoneNumber((value as string) || '')
                updatedCode = foundCountry ? foundCountry?.code as string : lastCountryCode as string
                updatedDialCode = foundCountry ? foundCountry?.dial_code as string : lastDialCode as string
                setSelectedCountry(updatedCode as string)
                setSelectedCountryCode(updatedDialCode as string)
            } 
        }
    }, [])

    return (
        <StyledInputWrapper>
            <DropdownCountry disable={readOnly} openDropdown={openDropdown} toggleDropdown={toggleDropdown} onChange={(item) => onChangeCountry(item)} choices={converInstanceToChoices()} labelField={'label'} valueField={'value'}>
                <View style={[{ flexDirection: 'row', alignItems: 'center' }, readOnly && {backgroundColor: Colors.disabledColor}]}>
                    <StyledFlagContainer>
                        {flagIcon}
                    </StyledFlagContainer>
                    <StyledVerticalLine />
                </View>
            </DropdownCountry>
            <PhoneNumberField
                {...props}
                countryCode={selectedCountryCode}
                onChange={onInputChange}
                value={currentValue as string}
                readOnly={readOnly}
                isManual={selectCountryManual}
                country={selectedCountry}
                changeType={setType}
                changeCountry={handleCountryChange}
            />
            {type && <StyledDialIcon testID='phone-number-type' style={{ backgroundColor: Colors.phoneNumberTypeColor }}>
                <Icon name={PHONE_NUMBER_TYPE_ICON_LIST[type]} color={Colors.white} size={24}/>
            </StyledDialIcon>}
            <StyledDialIcon testID='dial-view' style={{ borderTopRightRadius: 5, borderBottomRightRadius: 5 }} onPress={dialPhoneNumber}>
                <Icon name="phone" color={Colors.white} size={24}/>
            </StyledDialIcon>
        </StyledInputWrapper>
    )
}

export default PhoneNumberInput

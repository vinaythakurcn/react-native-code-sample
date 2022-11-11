import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components/native'
import { usePrevious } from '../../../utils/usePrevious'
import { findCountryWithDialCode, findDialCodePhoneNumber } from './utils'
import parsePhoneNumber, { getExampleNumber, AsYouType, isValidPhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js/max'
import Colors from '../../../theme/colors'
import { INumberInputProps } from './interface'
import { EXAMPLES_PHONE_NUMBERS } from './utils/examples'
import { ICountry } from './types'
import MaskInput from 'react-native-mask-input';
import { useDebouncedCallback } from 'use-debounce/lib'
import { DEBOUNCE_TIME, DEFAULT_MASK } from './constant'

/**
 * A object helps to display error message
 */
const ERROR_MSG_PHONE_NUMBER_LENGTH = {
    NOT_A_NUMBER: 'The phone number is not a number',
    INVALID_COUNTRY: 'The phone number is not for a valid country',
    TOO_SHORT: 'The phone number is too short',
    TOO_LONG: 'The phone number is too long',
    INVALID_LENGTH: 'The phone number length is not valid',
}

const PhoneNumberStyledMaskInput = styled(MaskInput)`
    flex: 1;
    padding: 0 12px;
    height: 100%;
    color: ${Colors.shadowGray};
    ${({editable}) => !editable ? `background-color: ${Colors.disabledColor};` : `background-color: ${Colors.white};`}
    font-size: 16px;
    font-weight: 500;
`

const PhoneNumberField: React.FC<INumberInputProps> = (props) => {
    const { style,
        readOnly,
        placeholder = "Enter mobile number here.",
        onChange,
        value,
        countryCode,
        country,
        onError,
        isManual, changeType, changeCountry } = props
    const [currentValue, setCurrentValue] = useState(value)
    /**
    * The custom hooks return previous value.
    * lastValue will be get when phone number length is grater than 5.
    * Because the highest country code length might be 5.
    */
    const lastValue = usePrevious(currentValue && currentValue.length > 5 && findDialCodePhoneNumber(currentValue))
    /** It's used for display phone number input mask. */
    const [phoneMask, setPhoneMask] = React.useState<any[]>([])

    /**
    * A function used in `onChange` event
    * User will update the value in the state 
    * And wrapper with hook in order to update based on `onChange` and `countryCode`
    * @param inputVal {string|null} The updated value. It will be validated and passed to `onChange` if valid.
    * @returns {void}
    */
    const handleChange = React.useCallback((changedNumber: string) => {
        /** Regex for phone number */
        const regex = new RegExp(/^(\+?[0-9]*?)?[0-9 ]*$/g)        

        if (regex.test(changedNumber)) {
            let currentPhoneNumber = changedNumber;
            /** Here we check if user type 00 then it will convert to */
            if (changedNumber?.startsWith('00')) {
                currentPhoneNumber = '+' + changedNumber.substring(2)
            }
            const phoneNumber = parsePhoneNumber(currentPhoneNumber)
            if (phoneNumber) {
                const parsedCountry = phoneNumber.country;
                changeType(phoneNumber.getType())
                if(country && parsedCountry) {
                    parsedCountry !== country && changeCountry(parsedCountry)
                } else if (!country && parsedCountry) {
                    changeCountry(parsedCountry)
                }
            }
            setCurrentValue(currentPhoneNumber);
            ; (onChange as (currentPhoneNumber: string | null) => void)(currentPhoneNumber || null)
        } else {
            onError && (onError as (message: string) => void)('Invalid input. You may only enter valid number values.')
        }
    },
        [onChange, countryCode]
    );

    /**
     * This function is check wheather the phone number input is valid or not
     */
    const onValidatePhoneNumber = () => {
        let msg = ''
        const phoneNumber = parsePhoneNumber(currentValue ? (currentValue as string) : '')
        if (currentValue && country && country !== 'default') {
            const lengthPhoneNumber = validatePhoneNumberLength(currentValue as string, country as any)
            msg = lengthPhoneNumber ? ERROR_MSG_PHONE_NUMBER_LENGTH[lengthPhoneNumber] : ''
                ; (onError as (message: string) => void)(msg)
        }
        if (phoneNumber?.isPossible() && !phoneNumber?.isValid() && country && country !== 'default') {
            msg = 'Warning! Phone Number is possible but invalid'
                ; (onError as (message: string) => void)(msg)
        }
        if (
            (phoneNumber?.isPossible() && phoneNumber?.isValid()) ||
            (country && country == 'default')
        ) {
            ; (onError as (message: string) => void)('')
        }
    }

    /**
     * This function validate phone number using debounce with time 7 sec.
     */
    const validatePhoneNumberWithDebunce = useDebouncedCallback(() => {
        onValidatePhoneNumber();
  }, DEBOUNCE_TIME);

  /**
   * This func is used to get formatted phone number based on countrycode
   * @param code pass country code
   * @param previousValue pass previous value of the number
   * @returns formatted phone number based on phone number
   */
  const getFormattedPhoneNumberFromCountryCode = (code: string| undefined, previousValue) => {
    const foundCountryCode = countryCode && findCountryWithDialCode(countryCode)
    const phoneNumber = (foundCountryCode as ICountry).dial_code as string + previousValue?.lastPhoneNumber as string;
    return new AsYouType().input(phoneNumber)
  }

  /**
   * This func will check wheather the value is valid phone number while focus on input
   */
  const handleOnFocus = () => {
    const isValid = isValidPhoneNumber(currentValue as string || '')
    if(!isValid && currentValue) {
        onError && onError('The phone number is not a valid number');
    }
  }

    /**
    * The useEffect used for rerender component for update the state value and props
    * It will be depend on `countryCode` and `isManual` changes.
    */
    useEffect(() => {
        if (lastValue && isManual && lastValue.lastDialCode !== countryCode) {
            const formattedPhoneNumber = getFormattedPhoneNumberFromCountryCode(countryCode, lastValue)
            setCurrentValue(formattedPhoneNumber)
        } else if (lastValue && isManual && lastValue.lastCountryCode !== country) {
            const formattedPhoneNumber = getFormattedPhoneNumberFromCountryCode(countryCode, lastValue)
            setCurrentValue(formattedPhoneNumber)
        } else if (!lastValue && countryCode && isManual) {
            setCurrentValue(countryCode)
        }
        
    }, [countryCode, isManual])

    /**
     * this effect will run when lastvalue is not available but value and countryCode is available
     * then we set value as currentvalue
     */
    useEffect(() => {
        if (!lastValue && value && countryCode) {
            setCurrentValue(value)
        }
    }, [value])

    /**
    * The useEffect used for update  mask value in the input.
    * It will be depend on `country`,`value` and `currentValue` changes.
    * Here we generate regExp for formating of the number based on input numbers.
    */
    useEffect(() => {
        const number = parsePhoneNumber(currentValue ? (currentValue as string) : '')
        const countryName = country === 'default' && number?.country ? number?.country : country
        if (countryName) {
            const phoneNumber = getExampleNumber(
                countryName as keyof typeof EXAMPLES_PHONE_NUMBERS,
                EXAMPLES_PHONE_NUMBERS
            )
            const replaceNumberWithZero = phoneNumber?.formatInternational().replace(/[1-9]/g, '0');
            const splittedValue = replaceNumberWithZero?.split('')
            const maskedArray: any[] = []
            splittedValue?.forEach(item => {
                if (item === '0') {
                    maskedArray.push(Object(/\d/))
                } else if (item === '+') {
                    maskedArray.push(Object(/(\+ | \d)?/))
                } else {
                    maskedArray.push(item)
                }
            })
            setPhoneMask(maskedArray)
        }
    }, [value, currentValue, country])

    return (
        <>
            <PhoneNumberStyledMaskInput
                testID="phone-number-input-test"
                placeholder={placeholder}
                mask={!!phoneMask.length ? phoneMask : DEFAULT_MASK}
                onChangeText={handleChange}
                keyboardType={'phone-pad'}
                editable={!readOnly}
                returnKeyType={'done'}
                onEndEditing={onValidatePhoneNumber}
                onBlur={onValidatePhoneNumber}
                onKeyPress={() => validatePhoneNumberWithDebunce()}
                onFocus={handleOnFocus}
                style={[{
                    ...style,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    alignItems: 'center',
                    marginLeft: -268
                }]}
                value={currentValue ?? ''}
            />
        </>
    )
}

export default React.memo(PhoneNumberField)

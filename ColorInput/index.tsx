import React, { useState } from 'react'
import Button from '../Button'
import ColorPickerModal from './ColorPickerModal'

export interface IColorInput {

    /**
     * Represent the color value as hexcode
     */
    value?: string

    /**
     * Custom Label or Title of the button
     */
    label?: string

    /**
     * Custom Label or Title of the button
     */
    icon?: string

    /**
     * Event to be triggered when a color selected
     */
    onChange: (value: string) => void

    /**
     * Set this property to `true` to disable the button
     */
    disabled?: boolean

    /**
     * Set this property to `true` to set the button readonly
     */
    readOnly?: boolean
}

const ColorInput: React.FC<IColorInput> = (props) => {
    const { value: propValue, label, icon, onChange, ...restProps } = props

    const [value, setValue] = useState<string>(propValue || '')
    const [modalVisible, setModalVisible] = useState(false)

    React.useEffect(() => {
        if (!!propValue) {
            setValue(propValue)
        }
    }, [propValue])

    const onSelect = React.useCallback((color: string) => {
        if (restProps.disabled || restProps.readOnly) return;

        setModalVisible(false)

        if (typeof onChange == 'function') {
            setValue(color)
            onChange(color)
        }
    }, [value, onChange])

    return (
        <>
            <Button
                {...restProps}
                disabled={restProps.disabled || restProps.readOnly}
                icon={icon || 'wb-icon-pipette-full'}
                title={label || 'Pick a color'}
                onPress={() => setModalVisible(true)}
                style={{ backgroundColor: value }}
            />
            <ColorPickerModal
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
                onChange={(value: string) => onSelect(value)}
            />
        </>
    )
}

const areEqual = (prevProps: IColorInput, nextProps: IColorInput) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.label === nextProps.label &&
      prevProps.icon === nextProps.icon &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.readOnly === nextProps.readOnly
    );
  };

export default React.memo(ColorInput, areEqual)

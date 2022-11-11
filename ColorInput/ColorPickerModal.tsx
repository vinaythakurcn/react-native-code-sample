import React, { useRef, useState } from 'react'
import { Modal, Dimensions, StyleSheet } from 'react-native'
import WheelColorPicker from 'react-native-wheel-color-picker'
import styled from 'styled-components/native'
import Colors from '../../../theme/colors'

import Button from '../../FormInput/Button'

export interface IColorPickerModalProps {
    isOpen: boolean
    value?: string
    onChange: (value: string) => void
    onClose: () => void
}

const { height } = Dimensions.get('window')

const ModalContainer = styled.SafeAreaView`
    height: ${height}px;
    background-color: ${Colors.white};
`

const ContentArea = styled.View`
    height: 100%;
    margin: 12px 18px;
`
const FooterActionArea = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 12px;
`
const PickerArea = styled.ScrollView`
    flex: 1;
`

const ColorPickerModal: React.FC<IColorPickerModalProps> = (props) => {
    const { isOpen, onClose, onChange, value } = props
    const [currentValue, setCurrentValue] = useState<string>(value || '')
    const wheelRef = useRef<any>()

    return (
        <Modal
            animationType='slide'
            transparent={false}
            visible={isOpen}
            onRequestClose={() => {
                onClose()
            }}
        >
            <ModalContainer>
                <ContentArea>
                    <PickerArea>
                        <WheelColorPicker
                            ref={(r) => {
                                wheelRef.current = r
                            }}
                            color={value || Colors.requestFailedColor}
                            onColorChangeComplete={(color) => setCurrentValue(color)}
                        />
                    </PickerArea>
                    <FooterActionArea>
                        <Button
                            variant='default'
                            onPress={() => onClose()}
                            title={'Cancel'}
                            style={{ width: '45%', marginRight: 8 }}
                            icon={'highlight_off'}
                            IconStyle={style.btnStyle}
                        />
                        <Button
                            variant='default'
                            onPress={() => onChange(currentValue)}
                            title={'Apply'}
                            style={{ backgroundColor: Colors.darkButtonHover, borderWidth: 0, width: '45%', marginLeft: 8 }}
                            textStyle={{ color: Colors.white }}
                            icon={'check_circle_outline'}
                            IconStyle={[{ color: Colors.white }, style.btnStyle] as any}
                        />
                    </FooterActionArea>
                </ContentArea>
            </ModalContainer>
        </Modal>
    )
}

export default ColorPickerModal

const style = StyleSheet.create({
    btnStyle: {
        fontSize: 24,
        marginRight: 24,
    },
})

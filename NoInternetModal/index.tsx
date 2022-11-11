import * as React from 'react'
import styled from 'styled-components/native'
import { View, Dimensions, ViewStyle, TextStyle, Modal, Button } from 'react-native'

import { styles } from './styles'
import Text from '../Text'
import Colors from '../../theme/colors'
import { useAppDispatch, useAppSelector } from '../../app/AppHooks'
import { fetchBrigerConfig, loginUserAfterTokenExpired, setAuthToken } from '../../app/slices/authSlice'
import { fetchMenu, fetchNotification, fetchProfile } from '../../app/slices/menuSlice'

import NetInfo from "@react-native-community/netinfo";
import FlatButton from '../FlatButton'
import { decodeJWToken } from '../../utils/auth'
import { JWT_ACCESS_TOKEN_KEY } from '../../utils/constants'
import moment from 'moment'
import { isNil } from '../../utils'

const { height: H } = Dimensions.get('window')
export interface INoInternetModal {
    visible: boolean
    message?: string
    textStyle?: TextStyle
    containerStyle?: ViewStyle
}

const StyledModal = styled.View`
    height: ${H}px;
    justify-content: center;
    align-items: center;
    padding: 0 18px;
`

const NoInternetModal: React.FC<INoInternetModal> = (props) => {
    const { visible, children, containerStyle, message, textStyle } = props

    const { baseURL, isAuthenticated, token, brigerConfig } = useAppSelector(({ auth }) => auth)

    const dispatch = useAppDispatch()

    const retryToConnect = () => {
        NetInfo.refresh().then(async state => {
            if (state.isConnected) {
                if (isAuthenticated) {
                    const jwtRefreshDecoded = await decodeJWToken(JWT_ACCESS_TOKEN_KEY)
                    const expirationDate = moment(jwtRefreshDecoded.exp * 1000)
                    const now = moment()
                    if (!now.isBefore(expirationDate)) {
                        dispatch(loginUserAfterTokenExpired(baseURL))
                        if (!!brigerConfig && !!brigerConfig.menu && token) {
                            dispatch(fetchMenu(brigerConfig.menu))
                            dispatch(fetchProfile(brigerConfig.profile));
                            brigerConfig?.notification && dispatch(fetchNotification(brigerConfig.notification?.http));
                        }
                    } else {
                        setAuthToken(token)
                        if (!!brigerConfig && !!brigerConfig.menu && token) {
                            dispatch(fetchMenu(brigerConfig.menu))
                            dispatch(fetchProfile(brigerConfig.profile));
                            brigerConfig?.notification && dispatch(fetchNotification(brigerConfig.notification?.http));
                        }
                    }
                    if (!brigerConfig) {
                        dispatch(fetchBrigerConfig(baseURL))
                    }
                }
            }
        }).catch(err => {
            console.log('[NetInfo.refresh][err] : ', err);
        })
    }

    return (
        <>
            {children}
            <Modal
                visible={visible}
            >
                <StyledModal style={[{ backgroundColor: Colors.black40Color }]}>
                    <View testID='test-isfullscreen' style={[styles.container, containerStyle]}>
                        <Text testID='test-nointernet-text' style={[{ marginBottom: 50, paddingLeft: 10 }, textStyle]}>
                            {message}
                        </Text>
                        <View style={[styles.tryAgainBtnWrapper]}>
                            <FlatButton containerStyle={{ minWidth: 100 }} title='Try again' color={Colors.orange} onPress={retryToConnect} />
                        </View>
                    </View>
                </StyledModal>
            </Modal>
        </>
    )
}

NoInternetModal.defaultProps = {
    message: 'You do not have an internet connection. \nPlease connect to the internet to continue',
}

export default NoInternetModal

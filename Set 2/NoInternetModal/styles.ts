import { StyleSheet } from 'react-native'
import Colors from '../../theme/colors'

export const styles = StyleSheet.create({
    container: {
        width: 300,
        height: 250,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tryAgainBtnWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        paddingRight: 16,
    },
})

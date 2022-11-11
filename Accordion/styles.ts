import { StyleSheet } from "react-native";
import Colors from "../../../theme/colors";

 export const styles  = StyleSheet.create({
    container: {
        marginVertical:7
    },
    header: {
        flexDirection: 'row',
        marginHorizontal: 18
    },
    verticalDivider: {
        borderColor: Colors.textInputBorderColor,
        borderWidth: 0.6,
        marginHorizontal: 18,
        marginTop: 12
    },
    expandContent: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: Colors.selectOptionBackground,
        marginHorizontal: 18,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4
    }

})
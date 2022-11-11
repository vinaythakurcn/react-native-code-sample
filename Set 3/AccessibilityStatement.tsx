import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, SafeAreaView, Text, ScrollView } from 'react-native'

const AccessibilityStatement = () => {
    const { t } = useTranslation()
    const translateLang = t
    return (
        <>
            <View style={{ backgroundColor: '#a0ce61', flex: 1 }}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.containerView}>
                        <View style={styles.containerView}>
                            <View style={styles.containerFields}>
                                <View style={{ width: '90%' }}>
                                    <Text style={styles.textView}>
                                        {translateLang('common:Solutions_4_Health_is_committed')}
                                    </Text>
                                    <Text style={styles.textView}>{translateLang('common:This_Accessibility')}</Text>
                                    <Text style={styles.textView}>{translateLang('common:Compliance_status')}</Text>
                                    <Text style={styles.textView}>{translateLang('common:Fully_compliant')}</Text>
                                    <Text style={styles.textView}>{translateLang('common:Preparation')}</Text>
                                    <Text style={styles.textView}>{translateLang('common:This_statement')}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </>
    )
}

export default AccessibilityStatement

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: '15%',
        justifyContent: 'flex-start',
    },

    containerView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'column',
        backgroundColor: '#f5f6fa',
        paddingTop: 10,
        borderRadius: 10,
        paddingBottom: 1,
        // paddingLeft: 1,
        // paddingRight: 1,
        marginTop: 10,
        marginLeft: 22,
        marginRight: 22,
        marginBottom: 20,
    },
    textView: {
        color: '#5b5b5b',
        marginBottom: '5%',
        fontSize: 16,
        fontWeight: 'bold',
    },
    containerFields: {},
})

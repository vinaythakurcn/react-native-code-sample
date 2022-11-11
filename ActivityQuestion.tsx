import { Dimensions, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { CheckBox, Input } from 'react-native-elements'
import React, { useState } from 'react'
import { Questions, Survey } from '../../app/models/profileModel'

export interface ActivityQuestionPropTypes {
    item: Questions
    survey: Survey[]
    submitted: boolean
    translateLang: any
    taskList: any
    updateSurvey: (survey: Survey[]) => void
}

const ActivityQuestion: React.FC<ActivityQuestionPropTypes> = ({
    item,
    survey,
    submitted,
    translateLang,
    taskList,
    updateSurvey,
    ...props
}: ActivityQuestionPropTypes) => {
    const [selectedValue, setSelectedValue] = useState(item.selected)
    const [errorMessage] = useState(translateLang('common:SELECT_OPTION'))

    const settingValue = (value: any) => {
        var surveyData = [...survey]

        var qIndx = surveyData[2].question.findIndex(x => x.id == item.id)
        var cIndx = surveyData[2].question[qIndx].choices.findIndex(y => y.value == value)
        surveyData[2].question[qIndx].selected = surveyData[2].question[qIndx].choices[cIndx].value
        updateSurvey(surveyData)
        setSelectedValue(value)
    }

    return (
        <>
            <View style={styles.profileContainer}>
                <View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.fieldText}>{item.question}</Text>
                    </View>
                    <View style={styles.fieldContainer}>
                        <SafeAreaView>
                            <>
                                {item.choices.map(gData => (
                                    <>
                                        <CheckBox
                                            key={gData.id}
                                            title={gData.choice}
                                            onPress={value => {
                                                settingValue(gData.value)
                                            }}
                                            checked={gData.value == selectedValue ? true : false}
                                            containerStyle={{
                                                backgroundColor: 'transparent',
                                                justifyContent: 'center',
                                                marginBottom: -3,
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                            }}
                                            textStyle={{ fontWeight: 'normal' }}
                                        />
                                    </>
                                ))}
                                <Input
                                    autoCompleteType={false}
                                    placeholder={selectedValue == 21 ? 'Specify Mental Condition' : 'Other'}
                                    containerStyle={
                                        selectedValue == 9 ||
                                        selectedValue == 21 ||
                                        selectedValue == 22 ||
                                        selectedValue == 30
                                            ? styles.fieldStyle
                                            : styles.hide
                                    }
                                    inputContainerStyle={{ borderBottomWidth: 0 }}
                                />
                            </>
                        </SafeAreaView>
                    </View>
                </View>
                <Text style={selectedValue == 0 && submitted ? styles.showError : styles.hide}>{errorMessage}</Text>
            </View>
        </>
    )
}

export default ActivityQuestion

const styles = StyleSheet.create({
    profileContainer: {
        // width: Dimensions.get('window').width - 25,
        marginTop: 0,
        marginRight: 10,
        marginBottom: 10,
        marginLeft: 10,
    },

    titleContainer: {
        backgroundColor: '#F7F7F7',
        paddingTop: 12,
        paddingRight: 5,
        paddingLeft: 12,
        paddingBottom: 12,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
    },
    fieldText: {
        fontSize: 15,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'open-sans',
        fontWeight: '700',
        color: '#646669',
    },
    fieldContainer: {
        marginBottom: 10,
    },

    hide: {
        display: 'none',
    },
    fieldStyle: {
        width: Dimensions.get('window').width - 50,
        backgroundColor: '#F7F7F7',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
        padding: 5,
    },
    showError: {
        fontWeight: 'bold',
        paddingVertical: 10,
        marginLeft: 10,
        color: 'red',
    },
})

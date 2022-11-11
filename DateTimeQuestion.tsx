import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native'
import Fontisto from 'react-native-vector-icons/Fontisto'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import { QuestionPropTypes } from './QuestionPropType'

export const DateTimeQuestion = ({ item, survey, submitted, updateSurvey, ...props }: QuestionPropTypes) => {
    const [showPicker, setShowPicker] = useState<boolean>(false)
    const [date, setDate] = useState(new Date())
    const [updatedDate, setUpdatedDate] = useState<string | any>('')
    const [currentDate, setCurrentDate] = useState<string | any>('')

    const onChangeDate = (chngDate: any) => {
        if (Platform.OS !== 'ios') {
            setShowPicker(false)
        }
        const dt = new Date(chngDate.nativeEvent.timestamp)
        updateDOB(dt)
    }

    const updateDOB = (updtDate: any) => {
        if (!isNaN(updtDate)) {
            setDate(updtDate)
            setUpdatedDate(moment(updtDate).format('DD-MMM-YYYY'))
        } else {
            // setDate(new Date())
            setDate(new Date(2012, 11, 31))
            setCurrentDate(updatedDate)
        }

        var surveyData: [] | any = [...survey]

        var qIndx = surveyData[0].question.findIndex((x: any) => x.id == item.id)
        surveyData[0].question[qIndx].selected = updtDate.toISOString()
        updateSurvey(surveyData)
    }

    useEffect(() => {
        const patt = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/g
        const dt =
            !!item.selected && typeof item.selected === 'string' && patt.test(item.selected)
                ? new Date(item.selected)
                : new Date(2012, 11, 31)
        // : new Date()
        updateDOB(dt)
    }, [])


    return (
        <>
            <View style={styles.profileContainer}>
                <View key={item.key}>
                    <>
                        <View style={styles.titleContainer}>
                            <Text style={styles.fieldText}>{item.question}</Text>
                        </View>
                        <View
                            style={{
                                // marginLeft: '2%',
                                marginBottom: 10,
                                backgroundColor: '#e8e8e8',
                                marginTop: 10,
                                borderRadius: 10,
                                padding: 10,
                                // width: Dimensions.get('window').width - 30,
                            }}>
                            <View style={{ marginLeft: '3%' }}>
                                <TouchableOpacity
                                    onPress={() => setShowPicker(true)}
                                    style={{ flex: 1, flexDirection: 'row' }}>
                                    <Fontisto name='calendar' size={25} color={'#087bc0'} />

                                    <Text
                                        style={{
                                            marginLeft: 7,
                                            marginTop: 3,
                                            fontSize: 15,
                                        }}>
                                        {updatedDate.length > 0 ? updatedDate : currentDate}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {showPicker ? (
                                <View>
                                    {Platform.OS == 'ios' ? (
                                        <View style={styles.datePickerDone}>
                                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                                <Text
                                                    style={{
                                                        color: '#087bc0',
                                                        fontSize: 16,
                                                    }}>
                                                    Done
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : null}

                                    <DateTimePicker
                                        testID='dateTimePicker'
                                        maximumDate={new Date(2012, 11, 31)}
                                        value={!date ? updatedDate : date}
                                        is24Hour={true}
                                        display={Platform.OS == 'ios' ? 'spinner' : 'default'}
                                        onChange={cDate => onChangeDate(cDate)}
                                    />
                                </View>
                            ) : null}
                        </View>
                    </>
                </View>
            </View>
        </>
    )
}

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
    inputField: {
        height: 40,
        // margin: 12,
        // marginLeft: 5,
        // marginRight: 5,
        borderWidth: 0,
        padding: 10,
        // borderColor: '#000',
        borderRadius: 10,
        backgroundColor: '#e8e8e8',
    },
    datePickerDone: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 16,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: '#e8e8e8',
    },
})

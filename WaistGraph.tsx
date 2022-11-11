/* eslint-disable semi */
import { ActivityIndicator, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import Label from '../Dashboard/CustomFiles/ChartLabel'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import * as shape from 'd3-shape'
import { useTranslation } from 'react-i18next'
import { Path, Defs, LinearGradient, Stop } from 'react-native-svg'
import { AreaChart, YAxis } from 'react-native-svg-charts'
import { getWaistAllWeek } from '../../app/actions/myProcessAction'

const Gradient = () => (
    <Defs key={'gradient'}>
        <LinearGradient id={'gradient'} x1={'0'} y1={'0%'} x2={'100%'} y2={'0%'}>
            <Stop offset={'100%'} stopColor={'rgb(134, 65, 244)'} />
            <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'} />
        </LinearGradient>
    </Defs>
)

const WaistGraph = (props: any) => {
    const { t } = useTranslation()
    const translateLang = t
    const dispatch = useAppDispatch()

    const { selectedLang } = useAppSelector(state => state.auth)
    const { waistItems, isLoading } = useAppSelector(state => state.myProcess)
    const [waistItemsData, setWaistItemsData] = useState<[] | any>([])

    const axesSvg = { fontSize: 10, fill: 'grey' }
    let selectedLangData: string = selectedLang as string

    useEffect(() => {
        dispatch(getWaistAllWeek({ selectedLangData }))
            .unwrap()
            .then(resp => {
                const waistData = resp.reduce((pre: number | any, current) => {
                    pre += current
                    return pre
                }, 0)

                setWaistItemsData(waistData)
            })
            .catch(err => {
                console.log(err)
            })
    }, [waistItemsData])

    const Line = ({ line }: any) => <Path d={line} stroke={'rgba(134, 65, 244)'} fill={'none'} strokeWidth='2.5' />
    const Waist_value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    return (
        <>
            <SafeAreaView>
                <ActivityIndicator
                    size='small'
                    color='#0000ff'
                    animating={isLoading}
                    style={isLoading ? styles.show : styles.hide}
                />

                <View
                    style={{
                        width: props.dashboardWaistGraph
                            ? Dimensions.get('window').width - 40
                            : Dimensions.get('window').width - 20,
                        marginTop: 5,
                        paddingTop: 10,
                        marginBottom: 10,
                        backgroundColor: props.dashboardWaistGraph ? '#fff' : '#F5F6FA',
                        borderRadius: 10,
                        overflow: 'hidden',
                        alignSelf: 'center',
                    }}>
                    {props.dashboardWaistGraph ? true : <Label title={translateLang('common:My_waist_progress')} />}
                    {!waistItems && props.dashboardWaistGraph ? (
                        <>
                            <View style={{ height: 200, flexDirection: 'row' }}>
                                <YAxis data={Waist_value} contentInset={{ top: 20, bottom: 30 }} svg={axesSvg} />
                                <AreaChart
                                    style={{ flex: 1, height: 200 }}
                                    data={Waist_value}
                                    svg={{ fill: '#087bc0' }}
                                    contentInset={{ top: 20, bottom: 30 }}
                                    curve={shape.curveNatural}>
                                    <Line />

                                    <Gradient />
                                </AreaChart>
                            </View>
                        </>
                    ) : waistItemsData == 0 && !props.dashboardWaistGraph ? (
                        <>
                            <View style={{ alignItems: 'center', marginLeft: '1%', marginVertical: 20 }}>
                                <Label
                                    title={translateLang('common:Waist_Measurement_Add')}
                                    color={'#2f3030'}
                                    size={15}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.historyView}
                                onPress={() => props?.navigation?.navigate('MyDiary')}>
                                <Text style={{ textAlign: 'center', color: '#ffffff', fontSize: 16 }}>
                                    {translateLang('common:Go_Diary')}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={{ height: 200, flexDirection: 'row' }}>
                                <YAxis data={waistItems} contentInset={{ top: 20, bottom: 30 }} svg={axesSvg} />
                                <AreaChart
                                    style={{ flex: 1, height: 200 }}
                                    data={waistItems}
                                    svg={{ fill: '#087bc0' }}
                                    contentInset={{ top: 20, bottom: 30 }}
                                    curve={shape.curveNatural}>
                                    <Line />

                                    <Gradient />
                                </AreaChart>
                            </View>
                        </>
                    )}
                </View>
            </SafeAreaView>
        </>
    )
}

export default WaistGraph

const styles = StyleSheet.create({
    hide: {
        display: 'none',
    },
    show: {},
    historyView: {
        overflow: 'hidden',
        alignSelf: 'center',
        borderRadius: 5,
        backgroundColor: '#087bc0',
        paddingVertical: 10,
        width: 150,
        marginBottom: 10,
        marginTop: 10,
        top: 3,
    },
})

import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, Dimensions, SafeAreaView, ActivityIndicator, Platform } from 'react-native'
import { LineChart, BarChart } from 'react-native-chart-kit'
import { useTranslation } from 'react-i18next'
import Heading from './Label'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import Label from '../Dashboard/CustomFiles/ChartLabel'
import WeightGoal from '../Dashboard/WeightGoal'
import { getBMIAllWeek } from '../../app/actions/myProcessAction'

type bmiStateType = {
    labels?: string[]
    data?: number[]
}

const BMIWeightGraph = (props: any) => {
    const {
        showOnDashboard,
        dashboardBMIGraph,
        task1Status,
        dashboardWeightGraph,
        setTargetedWeight,
        bmiProgressDashboard,
    } = props
    const screenWidth = Dimensions.get('window').width - 40

    const { t } = useTranslation()
    const translateLang = t
    const dispatch = useAppDispatch()
    const { BMIAllItems, isLoading } = useAppSelector(state => state.myProcess)
    const { weekItems } = useAppSelector(state => state.week)

    /**
     * State for the BMI Chart
     */
    const [bmiState, setBmiState] = useState<bmiStateType>({
        labels: [],
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    })

    /**
     * State for the Weight Chart
     */
    const [weightState, setWeightState] = useState<bmiStateType>({
        labels: [],
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    })

    /**
     * Preparing the Chart Data
     */
    const newMountedBMI = () => {
        var dataLabels: any = []
        var dataPoints: any = []
        var BMIdataLabels: any = []
        var BMIdataPoints: any = []

        BMIAllItems?.bmi?.map((data: any) => {
            if (data.value != 0) {
                BMIdataLabels.push(data.type)
                BMIdataPoints.push(data.value)
            }
        })
        if (BMIdataPoints?.length > 0) {
            setBmiState({
                labels: BMIdataLabels,
                data: BMIdataPoints,
            })
        }
        BMIAllItems?.weight?.map((data: any) => {
            if (data.value != 0) {
                dataLabels.push(data.type)
                dataPoints.push(data.value)
            }
        })
        if (dataPoints?.length > 0) {
            setWeightState({
                labels: dataLabels,
                data: dataPoints,
            })
        }
    }

    useEffect(() => {
        if (!!BMIAllItems && !!BMIAllItems.bmi && !!BMIAllItems.weight && !!BMIAllItems.weightLineGraph) {
            newMountedBMI()
        }
    }, [BMIAllItems])

    const data: any = React.useMemo(() => {
        return {
            labels: weightState.labels,
            datasets: [
                {
                    data: weightState.data,
                },
            ],
        }
    }, [weightState])

    const chartConfig = React.useMemo(() => {
        return {
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: '#FFFFFF',
            backgroundGradientToOpacity: 1,
            color: (opacity = 1) => `rgba(8, 123, 192, ${opacity})`,
            barPercentage: 0.5,
            data: data.datasets,
            fillShadowGradientOpacity: 1,
            decimalPlaces: 2,

            propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#ffa726',
            },
        }
    }, [data])

    const BMIdata: any = React.useMemo(() => {
        return {
            labels: bmiState.labels,
            datasets: [
                {
                    data: bmiState.data,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // optional
                    strokeWidth: 1, // optional,
                },
            ],
        }
    }, [weightState])

    useEffect(() => {
        dispatch(getBMIAllWeek({ showOnDashboard }))
    }, [weekItems])

    return (
        <>
            <SafeAreaView>
                <ActivityIndicator
                    size='small'
                    color='#0000ff'
                    animating={isLoading}
                    style={isLoading ? styles.show : styles.hide}
                />

                {dashboardBMIGraph ? null : (
                    <View
                        style={
                            dashboardWeightGraph
                                ? {
                                      width: Dimensions.get('window').width - 25,
                                      marginTop: 5,
                                      paddingTop: 10,
                                      marginBottom: 10,
                                      backgroundColor: '#fff',
                                      borderRadius: 10,
                                      overflow: 'hidden',
                                      alignSelf: 'center',
                                  }
                                : styles.originalView
                        }>
                        {showOnDashboard ? (
                            <View style={styles.textView}>
                                <Heading title={translateLang('common:Weekly_Weight_Progress')} />
                                {task1Status == 'completed' ? (
                                    <WeightGoal navigation={props.navigation} route={props.navigation} />
                                ) : (
                                    <View />
                                )}
                            </View>
                        ) : (
                            <View />
                        )}

                        {dashboardWeightGraph ? null : (
                            <Label
                                title={translateLang('common:Weekly_Weight_Progress')}
                                color={showOnDashboard ? 'white' : 'black'}
                            />
                        )}

                        <BarChart
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                                marginLeft: -15,
                            }}
                            data={data}
                            width={screenWidth}
                            height={200}
                            chartConfig={chartConfig}
                            showValuesOnTopOfBars={true}
                            fromZero={false}
                        />
                    </View>
                )}

                {bmiProgressDashboard == false || dashboardWeightGraph ? null : (
                    <View style={dashboardBMIGraph ? styles.dashboardView : styles.originalView}>
                        {showOnDashboard ? (
                            <View style={styles.textView}>
                                <Heading title={translateLang('common:Weekly_BMI_Progress')} />
                            </View>
                        ) : (
                            <View />
                        )}
                        {dashboardBMIGraph ? null : (
                            <Label
                                title={translateLang('common:Weekly_BMI_Progress')}
                                color={showOnDashboard ? 'white' : 'black'}
                            />
                        )}

                        <LineChart
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                                marginLeft: -15,
                            }}
                            data={BMIdata}
                            width={screenWidth}
                            height={200}
                            bezier
                            chartConfig={chartConfig}
                            showValuesOnTopOfBars={true}
                            radius={150}
                            fromZero={true}
                        />
                    </View>
                )}
            </SafeAreaView>
        </>
    )
}

export default BMIWeightGraph

const styles = StyleSheet.create({
    container: {
        height: '100%',
    },
    hide: {
        display: 'none',
    },
    show: {},
    originalView: {
        width: Dimensions.get('window').width - 15,
        marginTop: 5,
        paddingTop: 10,
        marginBottom: 10,
        backgroundColor: '#F5F6FA',
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    dashboardView: {
        width: Dimensions.get('window').width - 45,
        marginTop: 5,
        paddingTop: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    textView: {
        zIndex: 100,
        top: -30,
        position: 'absolute',
        height: '50%',
        justifyContent: 'center',
        borderRadius: 5,
        overflow: 'hidden',
        width: Platform.OS == 'ios' ? Dimensions.get('window').width + 6 : Dimensions.get('window').width - 5,
    },
})

import React from 'react'

import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MainNavigationParamList } from 'types/nagivation'
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment';

import MyDrawer from './MyDrawer'
import AddInstance from '../screens/AddInstance'
import ListingHeader from '../components/ListingHeader'
import Listing from '../screens/Listing'
import Chart from '../screens/Chart'
import NotFound from '../screens/NotFound'
import CalendarScreen from '../screens/CalendarScreen'
import { useAppDispatch, useAppSelector } from '../app/AppHooks'
import { fetchBrigerConfig, loginUserAfterTokenExpired, setAuthToken } from '../app/slices/authSlice'
import { fetchMenu, fetchNotification, fetchProfile } from '../app/slices/menuSlice'
import { setNoInternet } from '../app/slices/generalSlice'
import { decodeJWToken } from '../utils/auth';
import { JWT_ACCESS_TOKEN_KEY } from '../utils/constants';
import DashboardLoader from '../screens/DashboardLoader';
import NotificationScreen from '../screens/NotificationScreen';
import { isNil } from '../utils';

const MainStack = createNativeStackNavigator<MainNavigationParamList>()

const customHeader = ({ navigation, route }) => {
    const {label, endpoint, newMode} = (route.params as { label: string, endpoint: string, newMode: boolean })
    
    return <ListingHeader navigation={navigation} isShowNotification={false} newMode={newMode} title={label} endpoint={endpoint} openDrawer={navigation.openDrawer} />
}

const MainStackNavigator = () => {

    const {baseURL, isAuthenticated, token, brigerConfig} = useAppSelector(({auth}) => auth);

    const dispatch = useAppDispatch();

    React.useEffect(() => {
        // Subscribe
        const unsubscribe = NetInfo.addEventListener(handleNetState);
    
        return () => {
          // Unsubscribe
          unsubscribe();
        }
    })

    const onTokenChanges = async () => {
        if (isAuthenticated) {
            if (!brigerConfig) dispatch(fetchBrigerConfig(baseURL));
        }
        if(token) {
            const jwtRefreshDecoded = await decodeJWToken(JWT_ACCESS_TOKEN_KEY)
            const expirationDate = moment(jwtRefreshDecoded.exp * 1000)
            const now = moment()
            if (!now.isBefore(expirationDate)) {
                dispatch(loginUserAfterTokenExpired(baseURL))
            } else {
                setAuthToken(token)
            }
        }
    }
    React.useEffect(() => {
        onTokenChanges()
    }, [isAuthenticated, token]);
    
    const onBrigerConfigChanges = async () => {
        if(token) {
            const jwtRefreshDecoded = await decodeJWToken(JWT_ACCESS_TOKEN_KEY)
            const expirationDate = moment(jwtRefreshDecoded.exp * 1000)
            const now = moment()
            if (!now.isBefore(expirationDate)) {
                dispatch(loginUserAfterTokenExpired(baseURL))
            } else {
                setAuthToken(token)
                if (!!brigerConfig && !!brigerConfig.menu && token) {
                    dispatch(fetchMenu(brigerConfig.menu));
                    dispatch(fetchProfile(brigerConfig.profile));
                    if(!isNil(brigerConfig.notification)) dispatch(fetchNotification(brigerConfig.notification.http));
                }
            }
            
        }
    }
    React.useEffect(() => {
        onBrigerConfigChanges()
    }, [brigerConfig]);

    const handleNetState = (state) => {
        const internetConnected = state.isConnected
        if (internetConnected) {
            onBrigerConfigChanges();
        }
        dispatch(setNoInternet({noInternet: !internetConnected}))
    }

    return (
        <MainStack.Navigator initialRouteName='DashboardLoader'>
            <MainStack.Screen
                name='DashboardLoader'
                component={DashboardLoader}
                options={{
                    headerShown: false,
                }}
                initialParams={{ navigateURL: 'DrawerNavigation' }}
            />
            <MainStack.Screen
                name='DrawerNavigation'
                component={MyDrawer}
                options={{
                    headerShown: false,
                }}
            />
            <MainStack.Screen
                name='AddInstance'
                component={AddInstance}
                options={{
                    // unmountOnBlur: true,
                    header: customHeader,
                }}
            />
            <MainStack.Screen
                name='Listing'
                component={Listing}
                options={{
                    // unmountOnBlur: true,
                    header: customHeader,
                }}
            />
            <MainStack.Screen
                name='Chart'
                component={Chart}
                options={{
                    // unmountOnBlur: true,
                    header: customHeader,
                }}
            />
            <MainStack.Screen
                name='CalendarScreen'
                component={CalendarScreen}
                options={{
                    // unmountOnBlur: true,
                    header: customHeader,
                }}
            />
            <MainStack.Screen
                name='NotificationScreen'
                component={NotificationScreen}
                options={{
                    // unmountOnBlur: true,
                    header: customHeader,
                }}
            />
            <MainStack.Screen
                name='NotFound'
                component={NotFound}
                options={{
                    // unmountOnBlur: true,
                    header: customHeader,
                }}
            />
        </MainStack.Navigator>
    )
}

export default MainStackNavigator

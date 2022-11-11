import * as React from 'react'
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer'
import { Image, TouchableOpacity, View } from 'react-native'
import styled from 'styled-components/native'

import MenuItem from './MenuItem'
import Divider from '../components/Divider'
import DoubleMenuItem from './DoubleMenuItem'
import IconButton from '../components/IconButton'
import FlatButton, { FlatButtonIconPosition } from '../components/FlatButton'
import MenuHeaderProps from '../components/MenuHeader'
import { useAppDispatch, useAppSelector } from '../app/AppHooks'
import { IWBMenuLeafNode, IWBMenuNode } from '../interfaces/menuConfig'
import { sendOptionsRequest } from '../app'
import { getNavigationScreen } from './navigationUtils'
import { setLoading } from '../app/slices'
import Colors from '../theme/colors'
import ProfileDrawer from './ProfileDrawer'
import { logoutUser } from '../app/slices/authSlice'

const StyledHeaderText = styled.Text`
    text-transform: uppercase;
    font-family: 'Poppins-SemiBold';
    font-size: 20px;
    color: ${Colors.decoratorBackground};
`

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
    const { menu: mainMenu, profile } = useAppSelector(({ menu }) => menu)
    const [menu, setMenu] = React.useState([] as IWBMenuNode[])
    const [backMenuTitles, setBackMenuTitles] = React.useState([] as string[])
    const [trackMenus, setTrackMenus] = React.useState([] as IWBMenuNode[][])

    const dispatch = useAppDispatch()

    React.useEffect(() => {
        resetMenu()
    }, [mainMenu])

    const resetMenu = () => {
        setMenu([...mainMenu])
        setTrackMenus([])
        setBackMenuTitles([])
    }

    const navigateToHome = () => {
        resetMenu()
        props.navigation.navigate('Home')
    }

    /**
     * Render the Nested Menus(Nth Level) in the Side Drawer
     */
    const renderMenuItems = ({ label, items, add, endpoint }: IWBMenuNode & IWBMenuLeafNode, i: number) => {
        if (add) {
            return (
                <DoubleMenuItem key={i} onAdd={() => onAddClicked({ label, items, add, endpoint })}>
                    <MenuItem
                        title={label}
                        hasChildren={false}
                        onClick={() => onMenuClicked({ label, items, add, endpoint })}
                    />
                </DoubleMenuItem>
            )
        } else {
            return (
                <MenuItem
                    key={i}
                    title={label}
                    hasChildren={!!items}
                    onClick={() => onMenuClicked({ label, items, add, endpoint })}
                />
            )
        }
    }

    /**
     * Handle the Menu onPress event and decide the screen to be navigated to based on the 
     * OptionRequest
     */
    const onMenuClicked = ({ label, items, add, endpoint }: IWBMenuNode & IWBMenuLeafNode) => {
        console.log(label, items, add, endpoint)
        if (items) {
            const newTrackMenu = [...trackMenus, menu]

            setBackMenuTitles([...backMenuTitles, label])
            setMenu([...(items as IWBMenuNode[])])
            setTrackMenus(newTrackMenu)
        } else if (endpoint) {
            // props.navigation.navigate('ScreenController', {endpoint, label});
            dispatch(sendOptionsRequest({ url: endpoint }))
                .unwrap()
                .then((res) => {
                    const navigationScreenResp = getNavigationScreen(res, { endpoint, label })
                    if (navigationScreenResp.name != 'Chart') {
                        dispatch(setLoading({ loading: true }))
                        props.navigation.navigate(navigationScreenResp.name, navigationScreenResp.payload)
                    } else {
                        setTimeout(() => {
                            props.navigation.navigate(navigationScreenResp.name, navigationScreenResp.payload)
                        }, 700)
                    }
                })
        }
    }

    const onAddClicked = ({ label, items, add, endpoint }: IWBMenuNode & IWBMenuLeafNode) => {
        props.navigation.navigate('AddInstance', { label, endpoint: add?.endpoint, newMode: true })
    }

    /**
     * Controls the navigation between the nested menus
     */
    const backMenu = () => {
        const newTrackMenu = [...trackMenus]
        const prevMenu = newTrackMenu.pop()

        setBackMenuTitles(backMenuTitles.slice(0, backMenuTitles.length - 1))
        setMenu([...(prevMenu as IWBMenuNode[])])
        setTrackMenus(newTrackMenu)
    }

    const navigateToProfile = () => {
        const { name, profile: userProfile } = profile
        props.navigation.navigate('AddInstance', {
            label: 'Your Profile',
            endpoint: userProfile?.endpoint,
            newMode: false,
        })
    }

    const logoutProfile = () => {
        dispatch(logoutUser())
        dispatch(setLoading({ loading: true }))
    }

    const BackBtn = (
        <View style={{ marginLeft: 8 }}>
            <IconButton name='chevron_left' size={24} color={Colors.decoratorBackground} onPress={backMenu} />
        </View>
    )

    const CloseBtn = (
        <IconButton name='close' size={24} color={Colors.orange} onPress={() => props.navigation.closeDrawer()} />
    )
    return (
        <>
            {trackMenus.length > 0 ? (
                <MenuHeaderProps>
                    {BackBtn}
                    <StyledHeaderText>{backMenuTitles[backMenuTitles.length - 1]}</StyledHeaderText>
                    {CloseBtn}
                </MenuHeaderProps>
            ) : (
                <MenuHeaderProps>
                    <Image
                        style={{ width: 49, height: 34, marginLeft: 8 }}
                        source={require('../../assets/images/workbench-logo.png')}
                    />

                    <StyledHeaderText>Workbench</StyledHeaderText>
                    {CloseBtn}
                </MenuHeaderProps>
            )}

            <Divider width={90} />

            <DrawerContentScrollView {...props}>
                <MenuItem title='Home' onClick={() => navigateToHome()} hasChildren={false} />
                {menu.map((el, i) => renderMenuItems(el as any, i))}
            </DrawerContentScrollView>

            <Divider width={90} />

            <ProfileDrawer {...props} />

            <FlatButton
                title='Logout'
                icon='logout'
                iconPosition={FlatButtonIconPosition.LEFT}
                color={Colors.orange}
                onPress={() => logoutProfile()}
                containerStyle={{ marginLeft: 16 }}
            />
        </>
    )
}

export default CustomDrawerContent

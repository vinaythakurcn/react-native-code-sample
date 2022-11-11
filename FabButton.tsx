import * as React from 'react'
import { Alert, View } from 'react-native'
import { produce } from 'immer'
import { unwrapResult } from '@reduxjs/toolkit'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { FloatingAction } from 'react-native-floating-action'
import Toast from 'react-native-toast-message'

import {
    FormOnChangeArgumentType,
    IActionButtonProps,
    IDefaultState,
    IFields,
    IMethod,
    IPromptContentProps,
} from './interface'
import Icon from '../Icon'
import Colors from '../../theme/colors'
import { Form } from '../Form/Form'
import { useAppDispatch } from '../../app/AppHooks'
import { updateOptionsRequests } from '../../app/slices'
import TextEditorReadOnly from '../FormInput/TextEditorReadOnly'
import { MainNavigationParamList } from '../../types/nagivation'
import ActionButtonModal from './ActionButtonModal/ActionButtonModal'
import { getNavigationScreen } from '../../navigation/navigationUtils'
import { IFormFieldConfiguration, IFormFieldDefinition } from '../Form/types'
import { REQUEST_METHOD, sendInstanceRequest, sendOptionsRequest } from '../../app'
import ActionButtonConfirmPrompt from './ActionButtonModal/ActionButtonConfirmPrompt'
import ActionButtonStatefulPrompt from './ActionButtonModal/ActionButtonStatefulPrompt'
import ServerCommunicator, { FetchError, FetchResponse } from '../../api/ServerCommunicator'
import { evaluateHandlebarString, flattenInstanceDisplay, getIn, isNil } from '../../utils'
import { transformDefinitionToConfiguration } from '../Form/transformDefinitionToConfiguration'

const EMPTY_MAP = {}
const EMPTY_LIST = []
const SvrComm = new ServerCommunicator()

export interface IFabButtonProps {
    buttonProps: IButtonProps[]
}

export interface IObject {
    [key: string]: unknown
}

export interface IActions {
    text: string
    icon: JSX.Element
    name: string
    position: number
    color: string
}

export interface IButtonProps {
    label: string
    icon: string
    level: string
    key: string
    type: string
    new_mode: string
    buttons?: IButtonProps[]
    url?: string
}

interface IRefProps {
    animateButton: () => void
}

const defaultKeys = {
    color: Colors.buttonBar,
}

const convertToActions = (payload: IButtonProps[]) => {
    const actionsProps = payload
        .filter(
            (el) =>
                (el && el.type == 'dropdown' && el.buttons && !!el.buttons.filter((item) => item).length) ||
                (el && 'url' in el && !!el.url)
        )
        .map((buttonPayload: IButtonProps, index: number) => {
            return {
                text: buttonPayload.label,
                icon: <Icon name={buttonPayload.icon || 'settings'} color={Colors.black} />,
                name: getCustomKey(buttonPayload),
                position: index,
                ...defaultKeys,
            }
        })
    return actionsProps
}

const getCustomKey = (buttonPayload: IButtonProps) =>
    `${buttonPayload.key ?? buttonPayload.label?.replace(' ', '_').toLowerCase()}`

/**
 * Extracts the default values of all fields in `fields` and
 * returns a map that maps the field keys to the field default values.
 *
 * @param fields {object} Field definitions.
 * @param instance {object} The instance data. This is used to determine which
 * default data is required.
 * @param fieldMask {string[]} An optional list of field keys. If defined then
 * only the listed fields will be considered.
 *
 * @returns {object} A map that maps field keys to field
 * default values.
 */
function getDefaultState(
    fields: IFields,
    instance: IObject,
    fieldMask: string[],
    errors: { [key: string]: string[] } = {}
): IDefaultState {
    const relevantFields = !Array.isArray(fieldMask) ? fields : {}
    if (Array.isArray(fieldMask)) {
        fieldMask.forEach((fieldKey) => {
            relevantFields[fieldKey] = fields[fieldKey]
        })
    }
    return {
        errors,
        changes: produce(EMPTY_MAP, (draft) => {
            Object.entries(relevantFields).forEach(([fieldKey, field]) => {
                if (
                    typeof field.default !== 'undefined' &&
                    field.default !== null &&
                    (typeof instance === 'undefined' || typeof instance[fieldKey] === 'undefined')
                ) {
                    draft[fieldKey] = field.default
                }
            })
        }),
    }
}
/**
 * Sends a request of the given type to the given URL.
 * The payload is send with the request if the request method
 * is either `'post'`, `'put'`, or `'patch'`.
 * The controllers action will be set to `actionLabel` when the
 * request is being sent and progressed acording to the request status.
 *
 * @param {object} controllerAPI The API that manages the controller.
 * @param {string} actionLabel The label for the action buttons task.
 * @param {string} url The URL the request will be sent to.
 * @param {'get'|'post'|'put'|'patch'|'delete'} method The request method.
 * @param {object} payload The optional payload of the request.
 * @returns {Promise} The request promise which resolves or rejects
 * with the request response.
 */
export function sendRawRequest(
    controllerAPI: any,
    actionLabel: string,
    url: string,
    method: IMethod,
    payload = {} as IObject
): Promise<FetchResponse<IObject> | FetchError<IObject>> {
    let updatedURL = url
    if (method === REQUEST_METHOD.GET || method === REQUEST_METHOD.DELETE) {
        const payloadEntries = Object.entries(payload)
        if (payloadEntries.length > 0) {
            updatedURL =
                `${url}?` +
                payloadEntries
                    .map(([key, value]) =>
                        key !== 'cursor' ? `${key}=${encodeURIComponent(`${value}`)}` : `${key}=${value}`
                    )
                    .join('&')
        }
        payload = {}
    }
    return SvrComm.request(updatedURL, method, payload)
        .then((response: FetchResponse<IObject>) => {
            const requestWasSuccessful = response.status >= 200 || response.status < 400

            if (!requestWasSuccessful) {
                Toast.show({
                    type: 'error',
                    text1: `${actionLabel} failed!`,
                })
            } else {
                Toast.show({
                    type: 'success',
                    text1: `${actionLabel} successful!`,
                })
            }

            if (controllerAPI) {
                controllerAPI.refresh()
            }

            return response
        })
        .catch((err: FetchError<IObject>) => {
            const error = err.response ? err.response.data : err
            Toast.show({
                type: 'error',
                text1: `${actionLabel} failed!`,
            })
            return Promise.reject(error)
        })
}

/**
 * Sends a request of the given type to the given URL.
 * The payload is send with the request if the request method
 * is either `'post'`, `'put'`, or `'patch'`.
 * The controllers action will be set to `actionLabel` when the
 * request is being sent and progressed acording to the request status.
 *
 * @param {object} controllerAPI The API that manages the controller.
 * @param {string} actionLabel The label for the action buttons task.
 * @param {string} url The URL the request will be sent to.
 * @param {'get'|'post'|'put'|'patch'|'delete'} method The request method.
 * @param {object} payload The optional payload of the request.
 * @returns {Promise} The request promise which resolves or rejects
 * with the request response.
 */
function sendStoreRequest(
    controllerAPI: any,
    actionLabel: string,
    sendRequest: (url: string, method: IMethod, payload: IObject, identifiers: string[]) => Promise<any>,
    url: string,
    method: IMethod,
    payload = {} as IObject,
    identifiers: string[] = []
): Promise<FetchResponse<IObject> | FetchError<IObject> | IObject> {
    let updatedURL = url
    if (method === REQUEST_METHOD.GET || method === REQUEST_METHOD.DELETE) {
        const payloadEntries = Object.entries(payload)
        if (payloadEntries.length > 0) {
            updatedURL =
                `${url}?` +
                payloadEntries
                    .map(([key, value]) =>
                        key !== 'cursor' ? `${key}=${encodeURIComponent(`${value}`)}` : `${key}=${value}`
                    )
                    .join('&')
        }
        payload = {}
    }
    return sendRequest(updatedURL, method, payload, identifiers)
        .then(unwrapResult)
        .then((response: FetchResponse<IObject>) => {
            if (response.status >= 200 && response.status < 400) {
                Toast.show({
                    type: 'success',
                    text1: `${actionLabel} successful!`,
                })
                controllerAPI.refresh()
            } else {
                Toast.show({
                    type: 'error',
                    text1: `${actionLabel} failed!`,
                })
                console.warn('response:', response)
            }
            return response
        })
        .catch((err: FetchError<IObject>) => {
            const error = !isNil(err.response) ? err.response?.data : err
            Toast.show({
                type: 'error',
                text1: `${actionLabel} failed!`,
            })
            return Promise.reject(error)
        })
}

const PromptContent: React.FC<IPromptContentProps> = (props) => {
    const {
        state = {} as IDefaultState,
        defaultState = {} as IDefaultState,
        onChange: propsOnChange,
        descriptionFields,
        fields,
        instanceDisplay,
        instance,
    } = props

    const formLayout = React.useMemo(() => {
        return instanceDisplay ? instanceDisplay : EMPTY_LIST
    }, [instanceDisplay])
    const formConfiguration = React.useMemo(() => {
        const config = {} as { [key: string]: IFormFieldConfiguration<IObject> }
        const relevantFieldKeys = flattenInstanceDisplay(formLayout)
        Object.entries(fields)
            .filter(([fieldKey]) => relevantFieldKeys.includes(fieldKey))
            .forEach(([fieldKey, fieldDefinition]) => {
                config[fieldKey] = transformDefinitionToConfiguration(
                    fieldDefinition as IFormFieldDefinition<unknown>
                ) as IFormFieldConfiguration<IObject>
            })
        Object.entries(config).forEach(([fieldKey, fieldConfig]) => {
            if (
                fieldConfig.inputConfiguration &&
                (fieldConfig.inputConfiguration.type === 'asyncselect' ||
                    fieldConfig.inputConfiguration.type === 'select')
            ) {
                config[fieldKey] = produce(config[fieldKey], (draft) => {
                    draft.inputConfiguration.useOwnContextMenu = true
                })
            }
        })
        return config
    }, [fields, formLayout])
    const [changes, setChanges] = React.useState(defaultState.changes || {})
    const onChange = React.useCallback(
        (change: FormOnChangeArgumentType) => {
            setChanges((prevChanges) => {
                if (typeof change === 'function') {
                    return change(prevChanges)
                } else {
                    return {
                        ...prevChanges,
                        ...change,
                    }
                }
            })
            propsOnChange(change)
        },
        [propsOnChange]
    )
    const data = React.useMemo(() => {
        return {
            ...instance,
            ...changes,
        }
    }, [changes, instance])
    return (
        <>
            <View style={{ marginLeft: 8 }}>
                {descriptionFields && <TextEditorReadOnly value={descriptionFields} />}
            </View>
            <Form
                formLayout={formLayout as string[][]}
                formConfiguration={formConfiguration}
                values={data}
                errors={!isNil(state.errors) ? state.errors : EMPTY_MAP}
                onChange={onChange}
                onError={(err) => console.error(err)}
                updateRichTextEditorRef={() => {}}
            />
        </>
    )
}

/** A button that opens a new endpoint widget. */
const FabButton: React.FC<IFabButtonProps> = (props) => {
    const { buttonProps } = props
    const dispatch = useAppDispatch()
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>()

    const floatBtnRef = React.useRef(null)

    const [buttonStack, setButtonStack] = React.useState<IButtonProps[][]>([])
    const [actions, setActions] = React.useState<IActions[]>([])
    const [notUserEvent, setNotUserEvent] = React.useState<boolean>(false)
    const [actionButtonVisible, setActionButtonVisible] = React.useState<boolean>(false)
    const [actionBtnPrompt, setActionBtnPrompt] = React.useState<JSX.Element | null>()

    React.useEffect(() => {
        reset()
    }, buttonProps)

    const reset = () => {
        setButtonStack([buttonProps])
        setActions(convertToActions(buttonProps))
    }

    const handleOnPressWidget = ({ url, label, new_mode }: IButtonProps & { url: string }) => {
        dispatch(sendOptionsRequest({ url, maxAge: 0 }))
            .unwrap()
            .then((response) => {
                const { data, status } = response

                if (status && status >= 200 && status < 400) {
                    const navigationScreenResp = getNavigationScreen(response, {
                        endpoint: url,
                        label,
                        new_mode,
                    })
                    setTimeout(
                        () => {
                            navigation.push(navigationScreenResp.name as any, navigationScreenResp.payload)
                        },
                        navigationScreenResp.name == 'Chart' ? 700 : 0
                    )
                } else {
                    console.error('WidgetButton: Error while calling option request')
                    console.error(response)
                    return Promise.reject(response)
                }
            })
            .catch((err) => {
                console.error('WidgetButton: Error while fetching search result!', err)
                console.error(err)
            })
    }

    const handleActionItems = (name: string) => {
        setTimeout(() => {
            // console.log('[handleActionItems][name] : ', name);
            const topStack = buttonStack[buttonStack.length - 1]
            // console.log('[handleActionItems][topStack] : ', topStack);
            const selectedBtn = topStack.find((btn) => !!btn && getCustomKey(btn) === name)
            // console.log('[handleActionItems][selectedBtn] : ', selectedBtn);
            if (!!selectedBtn) {
                if (selectedBtn.type == 'widget') {
                    handleOnPressWidget(selectedBtn as IButtonProps & { url: string })
                } else if (selectedBtn.type == 'action') {
                    handleOnPressActionBtn(selectedBtn as unknown as IActionButtonProps)
                    reset()
                } else {
                    if (selectedBtn.buttons) {
                        setButtonStack([...buttonStack, selectedBtn.buttons])
                        setActions(convertToActions(selectedBtn.buttons))
                        ;(floatBtnRef?.current as unknown as IRefProps).animateButton()
                    }
                }
            }
        }, 200)
    }

    /**
     * Request handler for Action Button
     * @param url
     * @param method
     * @param payload
     * @param identifiers
     * @returns
     */
    const sendRequest = (url: string, method: IMethod, payload: IObject, identifiers: string[]) => {
        return dispatch(sendOptionsRequest({ url }))
            .unwrap()
            .then((optionsResponse: any) => {
                const identifier = getIn(['data', 'identifier'], optionsResponse)
                return dispatch(
                    sendInstanceRequest({
                        identifier,
                        url,
                        method: method as any,
                        payload,
                        maxAge: 0,
                    })
                )
            })
            .then((instanceResponse) => {
                if (method !== REQUEST_METHOD.GET) {
                    // We need to re-fetch the options requests for the given identifiers.
                    // The GET requests will be invalidated by the instance request store action anyway.
                    // NOTE: Using the identifiers only will update more requests than necessary.
                    identifiers.forEach((identifier) => {
                        // dispatch(invalidateInstanceRequests(identifier))
                        dispatch(updateOptionsRequests(identifier as any))
                    })
                }

                return instanceResponse
            })
    }

    /**
     * Action Button Click Handler
     * @param selectedBtn Selected Action Button
     * @returns
     */
    const handleOnPressActionBtn = (selectedBtn: IActionButtonProps) => {
        const {
            controllerAPI,
            identifiers,
            actionLabel,
            url,
            method,
            descriptionFields,
            cancelConfig,
            confirmConfig,
            instanceDisplay,
            fields,
            instance = {},
        } = selectedBtn
        const requestStrategy = !isNil(identifiers) && (identifiers as string[]).length > 0 ? 'store' : 'raw'

        const send = (payload = {}) => {
            if (requestStrategy === 'store') {
                return sendStoreRequest(
                    controllerAPI,
                    actionLabel as string,
                    sendRequest as (
                        url: string,
                        method: IMethod,
                        payload: IObject,
                        identifiers: string[]
                    ) => Promise<any>,
                    url,
                    method,
                    payload,
                    identifiers
                )
            } else {
                return sendRawRequest(controllerAPI, actionLabel as string, url, method, payload)
            }
        }

        let onClick = () => {
            send()
        }

        if (descriptionFields || cancelConfig || confirmConfig || instanceDisplay) {
            setActionButtonVisible(true)

            if (instanceDisplay) {
                if (!fields) {
                    console.warn(`On action buttons the 'fields' map must be defined if 'instanceDisplay' is defined!`)
                    return
                }

                /**
                 * Sends the request and closes the modal on success.
                 * It sets the error state of the stateful prompt on failure.
                 *
                 * @param {object} state The state of the stateful prompt.
                 * @param {Function} setState The state setter method of the stateful prompt.
                 * @param {Function} closePrompt The close prompt callback.
                 */
                const onCommit = async (state = EMPTY_MAP as IDefaultState, setState, closePrompt) => {
                    let payload = {}
                    // Make sure we commit only the fields that should be editable by the form.
                    flattenInstanceDisplay(instanceDisplay || []).forEach((fieldKey) => {
                        payload[fieldKey] = instance[fieldKey]
                    })
                    payload = { ...payload, ...state.changes }

                    try {
                        const { status, data } = (await send(payload as IObject)) as FetchResponse<IObject>
                        if (status >= 200 && status < 400) {
                            setActionButtonVisible(false)
                            setActionBtnPrompt(null)
                            controllerAPI.refresh()
                        } else {
                            setState((prevState: IDefaultState) =>
                                produce(prevState, (draft) => {
                                    draft.errors = data as { [key: string]: string[] }
                                })
                            )
                        }
                    } catch (error: any) {
                        Alert.alert(error.message)
                        setState((prevState: IDefaultState) =>
                            produce(prevState, (draft) => {
                                draft.errors = error.data ?? error
                            })
                        )
                    }
                }
                const defaultState = getDefaultState(
                    fields,
                    instance,
                    flattenInstanceDisplay(instanceDisplay || []),
                    {}
                )
                onClick = () => {
                    const element = (
                        <ActionButtonStatefulPrompt
                            onCommit={onCommit as (state: IDefaultState, setState: any) => Promise<void>}
                            onCancel={() => {
                                setActionButtonVisible(false)
                                setActionBtnPrompt(null)
                            }}
                            renderProp={(promptContentProps: any) => {
                                return (
                                    <PromptContent
                                        defaultState={defaultState}
                                        {...promptContentProps}
                                        instanceDisplay={instanceDisplay}
                                        fields={fields}
                                        descriptionFields={descriptionFields}
                                        instance={instance}
                                    />
                                )
                            }}
                            defaultState={defaultState}
                            cancelConfig={cancelConfig}
                            confirmConfig={confirmConfig}
                        />
                    )
                    setActionBtnPrompt(element)
                }
            } else {
                // Wrap `send` to show prompt before sending the request.
                onClick = () => {
                    const descriptionFieldsString = evaluateHandlebarString(descriptionFields || '', instance) as string
                    const element = (
                        <ActionButtonConfirmPrompt
                            {...selectedBtn}
                            message={descriptionFieldsString}
                            onCancel={() => {
                                setActionButtonVisible(false)
                                setActionBtnPrompt(null)
                            }}
                            onConfirm={async () => {
                                try {
                                    await send()
                                    setActionButtonVisible(false)
                                    setActionBtnPrompt(null)
                                } catch (error: any) {
                                    Alert.alert(error.message)
                                }
                            }}
                        />
                    )
                    setActionBtnPrompt(element)
                }
            }
        }

        /**
         * Finally calling the onClick
         */
        onClick()
    }

    const handleOnPressItem = (name: string | undefined) => {
        if (name) {
            setNotUserEvent(true)
            handleActionItems(name)
        }
    }

    const handleOnMainPress = () => {
        if (notUserEvent) {
            setNotUserEvent(false)
            return
        }
        if (buttonStack.length > 1) {
            const oldButtonStack = [...buttonStack]
            oldButtonStack.pop()
            setButtonStack([...oldButtonStack])
            setActions(convertToActions(oldButtonStack[oldButtonStack.length - 1]))

            setTimeout(() => {
                ;(floatBtnRef?.current as unknown as IRefProps).animateButton()
            }, 200)
        }
    }

    return (
        <>
            <View style={{ flex: 1 }}>
                <FloatingAction
                    ref={floatBtnRef}
                    visible={!!actions.length}
                    openOnMount={false}
                    color={Colors.orange}
                    overlayColor={Colors.overlayColor}
                    showBackground={false}
                    dismissKeyboardOnPress={true}
                    actions={actions}
                    floatingIcon={
                        <Icon
                            name={buttonStack.length == 1 ? 'settings' : 'arrow_back'}
                            color={Colors.white}
                            size={18}
                        />
                    }
                    onPressItem={(name) => handleOnPressItem(name)}
                    onPressMain={() => handleOnMainPress()}
                />
            </View>
            <ActionButtonModal
                isOpen={actionButtonVisible}
                onClose={() => setActionButtonVisible(false)}
                // optionsRequest={optionsRequest?.data as IOptionsRequestResponseData}
                onChange={(qs: string) => {}}
                actionButtonPrompt={actionBtnPrompt}
            />
        </>
    )
}

const areEqual = (prevProp: IFabButtonProps, newProp: IFabButtonProps) => {
    return prevProp.buttonProps == newProp.buttonProps
}

export default React.memo(FabButton, areEqual)

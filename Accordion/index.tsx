import Text from '../../../components/Text'
import * as React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Transition, Transitioning, TransitioningView } from 'react-native-reanimated'
import { IAccordionProps } from '../interface'
import { styles } from './styles'
import Colors from '../../../theme/colors'
import Icon from '../../Icon'

const transition = (
    <Transition.Together>
        <Transition.In type='fade' durationMs={250} />
        <Transition.Change />
        <Transition.Out type='fade' durationMs={150} />
    </Transition.Together>
)

const Accordion: React.FC<IAccordionProps> = (props) => {
    const { label, children, collapsed } = props
    const accordionRef = React.useRef<TransitioningView>(null)
    const [isExpanded, setIsExpanded] = React.useState(!collapsed)

    const toggleExpanded = React.useCallback(() => {
        setIsExpanded((prev) => !prev)
        accordionRef.current?.animateNextTransition()
    }, [isExpanded])

    return (
        <Transitioning.View ref={accordionRef} transition={transition} style={styles.container}>
            <View style={styles.header}>
                {!!label ? (
                    <Text
                        type='semibold'
                        testID='Accordion-Label'
                        style={{ flex: 1, color: Colors.decoratorBackground }}
                    >
                        {label}
                    </Text>
                ) : (
                    <></>
                )}
                <TouchableOpacity onPress={toggleExpanded}>
                    <Icon
                        name={`${isExpanded ? 'remove' : 'add'}_circle_outline`}
                        size={21}
                        color={isExpanded ? Colors.orange : Colors.decoratorBackground}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.verticalDivider} />
            {isExpanded && <View style={styles.expandContent}>{children}</View>}
        </Transitioning.View>
    )
}

export default Accordion

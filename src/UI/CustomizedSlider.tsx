import * as React from 'react'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Slider from '@material-ui/lab/Slider'
import { fade } from '@material-ui/core/styles/colorManipulator'

const useStyles = makeStyles({
    root: {
        width: 300,
        padding: 24,
    },
})

const StyledSlider = withStyles({
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid #de235b',
        '&$focused, &:hover': {
            boxShadow: `0px 0px 0px ${8}px ${fade('#de235b', 0.16)}`,
        },
        '&$activated': {
            boxShadow: `0px 0px 0px ${8 * 1.5}px ${fade('#de235b', 0.16)}`,
        },
        '&$jumped': {
            boxShadow: `0px 0px 0px ${8 * 1.5}px ${fade('#de235b', 0.16)}`,
        },
    },
    track: {
        backgroundColor: '#de235b',
        height: 8,
    },
    trackAfter: {
        backgroundColor: '#d0d7dc',
    },
    focused: {},
    activated: {},
    jumped: {},
})(Slider)

export const CustomizedSlider = (props: {
    xxx: {
        min: number
        max: number
        step: number
    }
    value: number,
    onMouseUp?: (value: number) => void
    onChange?: (value: number) => void
}) => {
    const classes = useStyles()
    const [value, setValue] = React.useState(props.value)


    return (
        <Paper className={classes.root}>
            <p>{value}</p>
            <br />
            <StyledSlider
                min={props.xxx.min}
                max={props.xxx.max}
                step={props.xxx.step}
                value={value}
                aria-labelledby='label'
                onMouseUp={
                    () => {
                        if (props.onMouseUp) props.onMouseUp(value)
                    }
                }
                onChange={(event, newValue) => {
                    setValue(newValue)
                    if (props.onChange) props.onChange(value)
                }} />
        </Paper>
    )
}
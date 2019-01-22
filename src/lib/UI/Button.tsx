import * as React from 'react'
import { style } from 'typestyle'
import { JSONRequestError } from '../C/JSONRequest'

const buttonStyle = style({
    margin: 'auto auto',
    width: '150px',
    height: '36px',
    lineHeight: '36px',
    borderRadius: '2px 2px 2px 2px',
    fontSize: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    $nest: {
        '&:active': {
            boxShadow: '2px 2px 2px #999 inset'
        }
    }
})

export class Button extends React.Component<{
    bgColor: string
    text: string
    left: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>
    right?: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>
}, { loading: boolean }> {

    componentWillMount() {
        this.setState({ loading: false })
    }

    callFunc(f: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>) {
        this.setState({ loading: true })
        f().then(({ error, msg, data }) => {
            if (error !== undefined) {
                //提示失败 error msg
            }
            else if (data === false) {
                //提示失败 overload
            }
            this.setState({ loading: false })
        })
    }
    render() {
        return this.state.loading ? '--' : <div
            className={buttonStyle}
            style={{ backgroundColor: this.props.bgColor }}
            onMouseDown={e => {
                if (e.button === 0) {
                    this.callFunc(this.props.left)
                } else if (e.button === 2) {
                    this.callFunc(this.props.right ? this.props.right : this.props.left)
                }
            }}
        >{this.props.text}</div>
    }
}
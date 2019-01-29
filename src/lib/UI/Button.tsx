import * as React from 'react'
import { style } from 'typestyle'
import { JSONRequestError } from '../C/JSONRequest'

const buttonStyle = style({
    // display:'inline',
    margin: 'auto auto',
    width: '150px',
    height: '36px',
    lineHeight: '36px',
    borderRadius: '2px 2px 2px 2px',
    fontSize: '18px',
    textAlign: 'center',
    $nest: {
        '&:active': {
            boxShadow: '2px 2px 2px #999 inset'
        }
    }
})

export class Button extends React.PureComponent<{
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
}, { loading: boolean, 上一次失败信息: string }> {

    componentWillMount() {
        this.setState({
            loading: false,
            上一次失败信息: '',
        })
    }

    callFunc(f: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>) {
        this.setState({
            loading: true,
            上一次失败信息: ''
        })
        f().then(({ error, msg, data }) => {
            if (error !== undefined) {
                //提示失败 error msg
                this.setState({ 上一次失败信息: error === '服务器返回错误' ? String(msg) : error })
            }
            else if (data === false) {
                //提示失败 overload
                this.setState({ 上一次失败信息: 'overload' })
            }
            else {
                this.setState({ 上一次失败信息: '' })
            }
            this.setState({ loading: false })
        })
    }
    render() {
        return <div
            className={buttonStyle}
            style={{
                backgroundColor: this.props.bgColor,
                opacity: this.state.loading ? 0.5 : 1,
                cursor: this.state.loading ? 'not-allowed' : 'pointer',
            }}
            onMouseDown={this.state.loading ? undefined : e => {
                if (e.button === 0) {
                    this.callFunc(this.props.left)
                } else if (e.button === 2) {
                    this.callFunc(this.props.right ? this.props.right : this.props.left)
                }
            }}
        >{this.state.上一次失败信息 !== '' ? this.state.上一次失败信息 : this.props.text}</div>
    }
}
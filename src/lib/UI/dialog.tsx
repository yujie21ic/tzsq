import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { remote } from 'electron'
import { DialogContent, DialogContentText, Dialog, DialogTitle, DialogActions, Button, TextField } from '@material-ui/core'

import { MuiPickersUtilsProvider, InlineDateTimePicker } from 'material-ui-pickers'
import * as MomentUtils from '@date-io/moment'
import 'moment/locale/zh-cn'

export namespace dialog {

    let div: HTMLDivElement
    const show = (el: React.ReactElement<any>) => {
        if (div === undefined) {
            div = document.createElement('div')
            document.body.appendChild(div)

            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
            document.head.appendChild(link)
        }
        ReactDOM.render(el, div)
    }

    const clear = () => show(<div />)


    class XXX extends React.Component<{
        type: 'text' | 'date'
        title: string
        value: string
        onOK: (str: string) => void
    }, { value: string }> {

        componentWillMount() {
            this.setState({ value: this.props.value })
        }

        render() {
            return <Dialog
                open={true}
                onClose={clear}
                aria-labelledby='form-dialog-title'
            >
                <DialogTitle id='form-dialog-title'>{this.props.title}</DialogTitle>

                <DialogContent>
                    {
                        this.props.type === 'text' ? <TextField
                            autoFocus
                            value={this.state.value}
                            onChange={e => this.setState({ value: e.target.value })}
                            fullWidth
                        /> :
                            <MuiPickersUtilsProvider utils={MomentUtils} locale='zh-cn'>
                                <InlineDateTimePicker
                                    value={this.state.value}
                                    onChange={(date: Date) => this.setState({ value: date.toISOString() })}
                                />
                            </MuiPickersUtilsProvider>
                    }


                </DialogContent>
                <DialogActions>
                    <Button onClick={clear} color='primary'>取消</Button>
                    <Button onClick={() => {
                        clear()
                        this.props.onOK(this.state.value)
                    }} color='primary'>确定</Button>
                </DialogActions>
            </Dialog>
        }
    }


    export const showInput = (p: {
        type: 'text' | 'date'
        title: string
        value: string
        onOK: (str: string) => void
    }) => show(<XXX {...p} />)


    export const showMessageBox = (p: { title: string, contentText: string }) => show(
        <Dialog
            key={Date.now()}
            open={true}
            onClose={clear}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle id='alert-dialog-title'>{p.title}</DialogTitle>

            <DialogContent>
                <DialogContentText id='alert-dialog-description'>{p.contentText}</DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={clear} color='primary'>OK</Button>
            </DialogActions>
        </Dialog>
    )



    export const popupMenu = (items: (
        {
            label: string
            checked?: boolean
            onClick: () => void
        } | undefined
    )[]) => {

        const menu = new remote.Menu()

        items.forEach(v =>

            menu.append(
                v !== undefined ?
                    new remote.MenuItem({
                        type: 'checkbox',
                        label: v.label,
                        checked: v.checked,
                        click: v.onClick,
                    }) :
                    new remote.MenuItem({
                        type: 'separator'
                    })
            )
        )

        menu.popup({
            window: remote.getCurrentWindow()
        })
    }
}
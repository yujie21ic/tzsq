import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { style } from 'typestyle'

const boxButton = style({
    margin: '15px auto',
    width: '149px',
    height: '36px',
    lineHeight: '36px',
    borderRadius: '2px 2px 2px 2px',
    fontSize: '18px',
    textAlign: 'center',
    boxShadow: '0px 8px 8px 0px rgba(0, 0, 0, 0.24)',
    $nest: {
        '&:active': {
            boxShadow: '2px 2px 2px #999 inset'
        }
    }
})
type Props = {
    xbtusd1: number,
    xbtusd2: number,
    delete1: number,
    task1: number,
    task2: number,
    ping1: number,
    data1: {
        number1: number,
        number2: number,
        color: string
    }[],
    data2: {
        number1: number,
        number2: number,
        color: string
    }[],
}
type State = {

}

class APP extends React.Component<Props, State> {
    componentWillMount() {
        this.setState({

        })
    }
    render() {
        return <div style={{
            margin: 'auto auto',
            width: '300px',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                backgroundColor: 'black',
                position: 'absolute',
                left: '0',
                top: '0',
                right: '-17px',
                bottom: '0',
                lineHeight: '200%',
                fontFamily: 'SourceHanSansSC-regular',
                color: 'white',
                fontSize: '24px',
                overflow: 'scroll'
            }}>
                <div style={{
                    padding: '10px 5px'
                }}>
                    <span>XBTUSD</span><br />
                    <span style={{ color: '#E56546', fontSize: '24px' }}>{this.props.xbtusd1}</span><br />
                    <span style={{ fontSize: '24px' }}>{this.props.xbtusd2}</span><br />
                    <span style={{ fontSize: '20px', marginRight: '5px' }}>STOP</span><input type='checkbox' name='stop' value='Bike' style={{ marginRight: '50px', }} />
                    <span style={{ color: '#48AA65', fontSize: '20px', marginRight: '5px' }}>{this.props.delete1}</span>
                    <button style={{ color: 'white', fontSize: '20px', margin: '0', padding: '0', border: '1px solid black', outline: 'none', backgroundColor: 'black' }}>X</button>
                </div>
                <div style={{
                    height: '5px',
                    width: '100%',
                    backgroundColor: '#BBBBBB'
                }}></div>
                <div
                    style={{
                        padding: '10px 5px'
                    }}>
                    <span>接针任务</span>
                    <div className={boxButton} style={{

                        backgroundColor: 'rgba(229, 101, 70, 1)',

                    }}>
                        {this.props.task1}</div>
                    <div className={boxButton} style={{

                        backgroundColor: 'rgba(72, 170, 101, 1)',

                    }}>
                        {this.props.task2}</div>
                </div>
                <div style={{
                    height: '5px',
                    width: '100%',
                    backgroundColor: '#BBBBBB'
                }}></div>
                <div style={{
                    padding: '10px 5px'
                }}>
                    <span>平仓任务</span>
                    <div className={boxButton} style={{
                        backgroundColor: 'rgba(150, 155, 174, 1)',

                    }}>
                        平{this.props.task2}</div>
                </div>
                <div style={{
                    height: '5px',
                    width: '100%',
                    backgroundColor: '#BBBBBB'
                }}></div>
                <div
                    style={{
                        padding: '10px 5px'
                    }}>
                    <span>活动委托</span>
                    <table >
                        <tbody>
                            {this.props.data1.map((v, i) =>
                                <tr style={{
                                    fontSize: '20px'
                                }}>
                                    <td style={{ color: v.color, textIndent: '20px' }}>{v.number1.toFixed(2)}</td>
                                    <td style={{ color: v.color, textIndent: '20px' }}>{v.number1.toFixed(2)}</td>
                                    <td style={{ textIndent: '20px' }}><button style={{ color: 'white', fontSize: '18px', margin: '0', padding: '0', border: '1px solid black', outline: 'none', backgroundColor: 'black' }}>X</button></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className={boxButton} style={{

                        backgroundColor: 'rgba(229, 101, 70, 1)',

                    }}>
                        {this.props.task1}</div>
                    <div className={boxButton} style={{

                        backgroundColor: 'rgba(72, 170, 101, 1)',

                    }}>
                        {this.props.task2}</div>
                    <table >
                        <tbody>
                            {this.props.data2.map((v, i) =>
                                <tr style={{
                                    fontSize: '20px'
                                }}>
                                    <td style={{ color: v.color, textIndent: '20px' }}>{v.number1.toFixed(2)}</td>
                                    <td style={{ color: v.color, textIndent: '20px' }}>{v.number1.toFixed(2)}</td>
                                    <td style={{ textIndent: '20px' }}><button style={{ color: 'white', fontSize: '18px', margin: '0', padding: '0', border: '1px solid black', outline: 'none', backgroundColor: 'black' }}>X</button></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div >
        </div>
    }
}

ReactDOM.render(<APP
    xbtusd1={-500}
    xbtusd2={3725.25}
    delete1={3780}
    task1={-500}
    task2={+500}
    ping1={500}
    data1={[
        {
            number1: 3750,
            number2: -500,
            color: 'rgba(229, 101, 70, 1)',
        },
        {
            number1: 3750,
            number2: -500,
            color: 'rgba(229, 101, 70, 1)',
        },
        {
            number1: 3750,
            number2: -500,
            color: 'rgba(229, 101, 70, 1)',
        }
    ]}
    data2={[
        {
            number1: 3720,
            number2: +460,
            color: 'rgba(72, 170, 101, 1)',
        },
        {
            number1: 3720,
            number2: +500,
            color: 'rgba(72, 170, 101, 1)',
        },
        {
            number1: 3720,
            number2: +500,
            color: 'rgba(255, 239, 85, 1)',
        }
    ]}
/>, document.querySelector('#root'))
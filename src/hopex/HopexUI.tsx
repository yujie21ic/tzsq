import * as React from 'react'
import { Table } from '../lib/UI/Table'

export class HopexUI extends React.Component {

    componentWillMount() {

        // const f = () => {
        //     requestAnimationFrame(f)
        //     this.forceUpdate()
        // }
        // f()
    }

    i = 110
    render() {
        return <div  >
            <h1>hopex {this.i++}</h1>
            <Table
                dataSource={[
                    {
                        id: 1,
                        x: 111,
                    },
                    {
                        id: 2,
                        x: 1222,
                    },
                ]}
                columns={[
                    {
                        title: '时间',
                        width: '50%',
                        render: v =>
                            <p style={{ color: '#49a965' }}>
                                {new Date().toLocaleString()}
                            </p>
                    },
                    {
                        title: '收益',
                        width: '50%',
                        render: v =>
                            <p style={{ color: '#e56546' }}>
                                {v.x}mXBT
                        </p>
                    },
                ]}
                rowKey={v => v.id}
            />
        </div>
    }

}
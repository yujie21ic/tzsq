import * as React from 'react'
import { style } from 'typestyle'

const div = style({
    height: '100%',
    width: '100%',
    margin: '8px',
    overflow: 'scroll',
})

const table = style({
    width: '100%',
    paddingRight: '10px',
    textAlign: 'right',
    borderLeft: '1px solid black',
    borderBottom: '1px solid black',
    fontSize: '20px',
})

const th_td = style({
    height: '30px',
    borderRight: '1px solid black',
    borderTop: '1px solid black',
    paddingRight: '5px',
    lineHeight: '30px',

})

const tr = style({
    $nest: {
        '&:nth-child(odd)': {
            backgroundColor: '#f5f2ee'
        },
        '&:nth-child(even)': {
            backgroundColor: '#ffffff'
        },
    }
})

export const Table = <T extends any>(props: {
    dataSource: T[]
    columns: {
        title: React.ReactNode
        width?: string
        render: (value: T, index: number) => React.ReactNode
    }[]
    rowKey: (value: T, index: number) => string | number
}) =>
    <div className={div}>
        <table className={table} cellPadding={0} cellSpacing={0}>
            <thead>
                <tr>
                    {
                        props.columns.map((v, i) =>
                            <th key={i} className={th_td} style={{ width: v.width }}>{v.title}</th>
                        )
                    }
                </tr>
            </thead>
            <tbody >
                {props.dataSource.map((v, i) =>
                    <tr key={props.rowKey(v, i)} className={tr}>
                        {
                            props.columns.map(({ render }, i) =>
                                <td key={i} className={th_td}>
                                    {render(v, i)}
                                </td>
                            )
                        }
                    </tr>
                )}
            </tbody>
        </table>
    </div>
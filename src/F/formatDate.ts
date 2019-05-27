export const formatDate = (
    date: Date,
    f: (
        v: {
            d: string
            dd: string
            hh: string
            mm: string
            ss: string
            msmsms: string
        }
    ) => string
) =>
    f({
        d: date.getDate().toString(),
        dd: date.getDate().toString().padStart(2, '0'),
        hh: date.getHours().toString().padStart(2, '0'),
        mm: date.getMinutes().toString().padStart(2, '0'),
        ss: date.getSeconds().toString().padStart(2, '0'),
        msmsms: date.getMilliseconds().toString().padStart(3, '0')
    })
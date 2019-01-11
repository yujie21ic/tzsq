export const formatDate = (
    date: Date,
    f: (
        v: {
            hh: string,
            mm: string,
            ss: string,
            msmsms: string
        }
    ) => string
) =>
    f({
        hh: date.getHours().toString().padStart(2, '0'),
        mm: date.getMinutes().toString().padStart(2, '0'),
        ss: date.getSeconds().toString().padStart(2, '0'),
        msmsms: date.getMilliseconds().toString().padStart(3, '0')
    })
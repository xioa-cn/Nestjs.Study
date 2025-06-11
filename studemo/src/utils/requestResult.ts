export interface RequestResult<T> {
    time: Date,
    state: string,
    data: T,
    success: boolean,
    message: string
}

export class ResponseUtil {
    static requestResultSuccess<T>(data: T): RequestResult<T> {
        return {
            time: new Date(),
            state: "0000",
            data: data,
            success: true,
            message: 'success'
        };
    }

    static requestResultError<T>(data: T, message: string, state: string): RequestResult<T> {
        return {
            time: new Date(),
            state: state,
            data: data,
            success: true,
            message: message
        };
    }
}

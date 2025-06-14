import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {RequestResult, ResponseUtil} from "./requestResult";
import {Reflector} from "@nestjs/core";
import {isArray, isObject} from "class-validator";
import {RawResponse} from "./RawResponse";

function isRequestResult<T>(data: any): data is RequestResult<T> {
    return isObject(data) && !isArray(data) &&
        'state' in data &&
        'time' in data &&
        'message' in data &&
        'success' in data &&
        'data' in data;
        
}
// 拦截器
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, RequestResult<T> | T> {
    constructor(private reflector: Reflector) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<RequestResult<T> | T> {
        // 检查是否使用了 @RawResponse 装饰器
        const isRawResponse = this.reflector.get(RawResponse, context.getHandler());
        if (isRawResponse) {
            return next.handle(); // 直接返回原始响应
        }

        // 获取HTTP上下文
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map(data => {
                // 特殊情况处理：已经是统一格式的响应、非对象类型、流数据等
                if (
                    // 已经是统一格式的响应
                    isRequestResult(data) ||
                   
                    // 流数据
                    data instanceof Buffer ||
                    // 重定向响应
                    response.statusCode >= 300 && response.statusCode < 400
                ) {
                    return data; // 不包装，直接返回
                }

                // 其他情况，使用统一格式包装
                return ResponseUtil.requestResultSuccess(data);
            }),
        );
    }
}
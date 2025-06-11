import { SetMetadata } from '@nestjs/common';

/**
 * 标记控制器方法不需要被统一响应拦截器处理
 */
export const RawResponse = () => SetMetadata('rawResponse', true);
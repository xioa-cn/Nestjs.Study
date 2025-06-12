import {
    SelectQueryBuilder,
    Repository,
    ObjectLiteral,
} from 'typeorm';

interface Condition {
    type: 'where' | 'andWhere' | 'orWhere';
    condition: string;
    parameters: Record<string, any>;
}

interface OrderBy {
    property: string;
    direction: 'ASC' | 'DESC';
}

export interface ILinqQuery<T extends ObjectLiteral> {
    where(condition: (entity: T) => boolean): ILinqQuery<T>;

    andWhere(condition: (entity: T) => boolean): ILinqQuery<T>;

    orWhere(condition: (entity: T) => boolean): ILinqQuery<T>;

    whereEq<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T>;

    whereGt<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T>;

    whereLt<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T>;

    whereGte<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T>;

    whereLte<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T>;

    whereLike<K extends keyof T>(property: K, value: string, options?: {
        startsWith?: boolean;
        endsWith?: boolean
    }): ILinqQuery<T>;

    whereIn<K extends keyof T>(property: K, values: T[K][]): ILinqQuery<T>;

    whereIsNull<K extends keyof T>(property: K): ILinqQuery<T>;

    whereIsNotNull<K extends keyof T>(property: K): ILinqQuery<T>;

    withVariable(name: string, value: any): ILinqQuery<T>;

    orderBy<K extends keyof T>(property: K, direction: 'ASC' | 'DESC'): ILinqQuery<T>;

    skip(take: number): ILinqQuery<T>;

    take(limit: number): ILinqQuery<T>;

    include<K extends keyof T>(relation: K): ILinqQuery<T>;

    toArray(): Promise<T[]>;

    first(): Promise<T | null>;

    count(): Promise<number>;

    toFindOptions(): any;
}

class QueryContext<T> {
    private variables: Record<string, any> = {};
    
    setVariable(name: string, value: any): void {
        this.variables[name] = value;
    }
    
    getVariable(name: string): any {
        return this.variables[name];
    }
    
    createCondition(condition: (entity: T) => boolean): (entity: T) => boolean {
        // 捕获当前上下文
        const context = this;

        // 返回一个新函数，它使用上下文来获取变量值
        return (entity: T) => {
            // 创建一个代理对象，用于捕获属性访问
            const proxy = new Proxy(entity as any, {
                get(target: T, prop: string | symbol): any {
                    // 只处理字符串属性
                    if (typeof prop === 'string') {
                        // 如果是变量名，从上下文中获取值
                        if (context.variables.hasOwnProperty(prop)) {
                            return context.variables[prop];
                        }
                        // 否则返回实体的属性值
                        return target[prop as keyof T];
                    }
                    // 对于 symbol 属性，返回 undefined
                    return undefined;
                }
            }) as unknown as T;

            // 执行原始条件函数，使用代理对象
            return condition(proxy);
        };
    }
}

export class LinqQueryBuilder<T extends ObjectLiteral> implements ILinqQuery<T> {
    private queryBuilder: SelectQueryBuilder<T>;
    private alias: string;
    private context: QueryContext<T> = new QueryContext<T>();
    private conditions: Condition[] = [];
    private orderByClauses: OrderBy[] = [];
    private skipValue: number | undefined;
    private takeValue: number | undefined;
    private relations: string[] = [];

    constructor(repository: Repository<T>, alias: string = 'entity') {
        this.queryBuilder = repository.createQueryBuilder(alias);
        this.alias = alias;
    }
    
    where(condition: (entity: T) => boolean): ILinqQuery<T> {
        // 解析条件函数
        const {condition: sqlCondition, parameters} = this.parseCondition(condition);
        this.conditions.push({type: 'where', condition: sqlCondition, parameters});
        return this;
    }
    
    andWhere(condition: (entity: T) => boolean): ILinqQuery<T> {
        const {condition: sqlCondition, parameters} = this.parseCondition(condition);
        this.conditions.push({type: 'andWhere', condition: sqlCondition, parameters});
        return this;
    }
    
    orWhere(condition: (entity: T) => boolean): ILinqQuery<T> {
        const {condition: sqlCondition, parameters} = this.parseCondition(condition);
        this.conditions.push({type: 'orWhere', condition: sqlCondition, parameters});
        return this;
    }
    
    whereEq<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T> {
        const paramName = `p_${String(property)}`;
        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} = :${paramName}`,
            parameters: {[paramName]: value}
        });
        return this;
    }

    whereGt<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T> {
        const paramName = `p_${String(property)}`;
        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} > :${paramName}`,
            parameters: {[paramName]: value}
        });
        return this;
    }

    whereLt<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T> {
        const paramName = `p_${String(property)}`;
        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} < :${paramName}`,
            parameters: {[paramName]: value}
        });
        return this;
    }

    whereGte<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T> {
        const paramName = `p_${String(property)}`;
        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} >= :${paramName}`,
            parameters: {[paramName]: value}
        });
        return this;
    }

    whereLte<K extends keyof T>(property: K, value: T[K]): ILinqQuery<T> {
        const paramName = `p_${String(property)}`;
        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} <= :${paramName}`,
            parameters: {[paramName]: value}
        });
        return this;
    }

    whereLike<K extends keyof T>(property: K, value: string, options?: {
        startsWith?: boolean;
        endsWith?: boolean
    })
        : ILinqQuery<T> {
        const paramName = `p_${String(property)}`;
        let formattedValue = value;

        if (!options || !options.startsWith) formattedValue = `%${formattedValue}`;
        if (!options || !options.endsWith) formattedValue = `${formattedValue}%`;

        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} LIKE :${paramName}`,
            parameters: {[paramName]: formattedValue}
        });
        return this;
    }

    whereIn<K extends keyof T>(property: K, values: T[K][]): ILinqQuery<T> {
        const paramName = `p_${String(property)}`;
        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} IN (:...${paramName})`,
            parameters: {[paramName]: values}
        });
        return this;
    }

    whereIsNull<K extends keyof T>(property: K): ILinqQuery<T> {
        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} IS NULL`,
            parameters: {}
        });
        return this;
    }

    whereIsNotNull<K extends keyof T>(property: K): ILinqQuery<T> {
        this.conditions.push({
            type: 'where',
            condition: `${this.alias}.${String(property)} IS NOT NULL`,
            parameters: {}
        });
        return this;
    }
    
    withVariable(name: string, value: any): ILinqQuery<T> {
        this.context.setVariable(name, value);
        return this;
    }
    
    orderBy<K extends keyof T>(property: K, direction: 'ASC' | 'DESC'): ILinqQuery<T> {
        this.orderByClauses.push({property: String(property), direction});
        return this;
    }
    
    skip(take: number): ILinqQuery<T> {
        this.skipValue = take;
        return this;
    }

    take(limit: number): ILinqQuery<T> {
        this.takeValue = limit;
        return this;
    }
    
    include<K extends keyof T>(relation: K): ILinqQuery<T> {
        this.relations.push(String(relation));
        return this;
    }
    
    private parseCondition(condition: (entity: T) => boolean): { condition: string, parameters: any } {
        try {
            const conditionStr = condition.toString();

            // 提取变量引用
            const varRegex = /\b(\w+)\b/g;
            const variables: Record<string, any> = {};
            let matches;

            while ((matches = varRegex.exec(conditionStr)) !== null) {
                const varName = matches[1];
                // 排除 entity 和已知的内置函数名
                if (varName !== 'entity' && !['true', 'false', 'null', 'undefined'].includes(varName)) {
                    // 尝试从上下文中获取变量值
                    const value = this.context.getVariable(varName);
                    if (value !== undefined) {
                        variables[varName] = value;
                    }
                }
            }
            
            const regex = /(?:entity|item)\.(\w+)\s*([=!><]+|(?:not\s+)?in|like|is\s+(?:not\s+)?null)\s*([^;)}]*)/i;
            const match = conditionStr.match(regex);

            if (match && match.length === 4) {
                const [, property, operator, valueExpr] = match;
                const paramName = `p_${property}`;

                // 解析值表达式
                let parsedValue: any;
                const trimmedValueExpr = valueExpr.trim();

                // 处理 IS NULL 和 IS NOT NULL
                if (/^is\s+(?:not\s+)?null$/i.test(operator)) {
                    return {
                        condition: `${this.alias}.${property} ${operator.toUpperCase()}`,
                        parameters: {}
                    };
                }

                // 检查是否是变量引用
                if (variables.hasOwnProperty(trimmedValueExpr)) {

                    parsedValue = variables[trimmedValueExpr];
                }
                // 其他解析逻辑
                else {
                    // 处理字符串字面量
                    if (/^['"](.*)['"]$/.test(trimmedValueExpr)) {
                        parsedValue = trimmedValueExpr.slice(1, -1);
                    }
                    // 处理布尔值
                    else if (trimmedValueExpr === "true") {
                        parsedValue = true;
                    } else if (trimmedValueExpr === "false") {
                        parsedValue = false;
                    }
                    // 处理数字
                    else if (!isNaN(Number(trimmedValueExpr))) {
                        parsedValue = Number(trimmedValueExpr);
                    }
                    // 处理 null/undefined
                    else if (trimmedValueExpr === "null") {
                        parsedValue = null;
                    } else if (trimmedValueExpr === "undefined") {
                        parsedValue = undefined;
                    }
                    // 处理数组 (in 操作符)
                    else if (/^\[.*\]$/.test(trimmedValueExpr)) {
                        parsedValue = trimmedValueExpr
                            .slice(1, -1)
                            .split(',')
                            .map(v => {
                                const trimmed = v.trim();
                                if (/^['"].*['"]$/.test(trimmed)) {
                                    return trimmed.slice(1, -1);
                                }
                                if (!isNaN(Number(trimmed))) {
                                    return Number(trimmed);
                                }
                                return trimmed;
                            });
                    } else {
                        console.warn(`无法解析表达式: ${trimmedValueExpr}，请使用 withVariable 设置变量`);
                        return {condition: "1=1", parameters: {}};
                    }
                }

                // 构建SQL条件
                let sqlCondition = "";
                const normalizedOperator = operator.toLowerCase().trim();

                switch (normalizedOperator) {
                    case "==":
                    case "===":
                        sqlCondition = `${this.alias}.${property} = :${paramName}`;
                        break;
                    case "!=":
                    case "!==":
                        sqlCondition = `${this.alias}.${property} != :${paramName}`;
                        break;
                    case ">":
                        sqlCondition = `${this.alias}.${property} > :${paramName}`;
                        break;
                    case "<":
                        sqlCondition = `${this.alias}.${property} < :${paramName}`;
                        break;
                    case ">=":
                        sqlCondition = `${this.alias}.${property} >= :${paramName}`;
                        break;
                    case "<=":
                        sqlCondition = `${this.alias}.${property} <= :${paramName}`;
                        break;
                    case "in":
                        sqlCondition = `${this.alias}.${property} IN (:...${paramName})`;
                        break;
                    case "not in":
                        sqlCondition = `${this.alias}.${property} NOT IN (:...${paramName})`;
                        break;
                    case "like":
                        sqlCondition = `${this.alias}.${property} LIKE :${paramName}`;
                        parsedValue = `%${parsedValue}%`;
                        break;
                    default:
                        sqlCondition = "1=1";
                }

                console.log({
                    condition: sqlCondition,
                    parameters: {
                        [paramName]: parsedValue
                    }
                });

                return {
                    condition: sqlCondition,
                    parameters: {[paramName]: parsedValue}
                };
            }
        } catch
            (error) {
            console.error('Error parsing condition:', error);
        }

        return {
            condition: "1=1",
            parameters: {}
        };
    }
    
    async toArray(): Promise<T[]> {
        // 应用所有条件到查询构建器
        this.applyConditions();

        try {
            return await this.queryBuilder.getMany();
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    async first(): Promise<T | null> {
        this.applyConditions();
        try {
            return await this.queryBuilder.getOne();
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    async count(): Promise<number> {
        this.applyConditions();
        try {
            return await this.queryBuilder.getCount();
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
    
    toFindOptions(): any {
        const where: any = {};

        this.conditions.forEach(condition => {
            const match = condition.condition.match(/(\w+)\.(\w+)\s*=\s*:\w+/);
            if (match && match.length === 3) {
                const [, alias, property] = match;
                if (alias === this.alias) {
                    const paramName = Object.keys(condition.parameters)[0];
                    where[property] = condition.parameters[paramName];
                }
            }
        });

        const order: any = {};
        this.orderByClauses.forEach(clause => {
            order[clause.property] = clause.direction;
        });

        return {
            where,
            order,
            skip: this.skipValue,
            take: this.takeValue,
            relations: this.relations
        };
    }
    
    private applyConditions(): void {
        // 重置查询构建器
        this.queryBuilder = this.queryBuilder.clone();

        // 应用条件
        this.conditions.forEach(condition => {
            switch (condition.type) {
                case 'where':
                    this.queryBuilder = this.queryBuilder.where(condition.condition, condition.parameters);
                    break;
                case 'andWhere':
                    this.queryBuilder = this.queryBuilder.andWhere(condition.condition, condition.parameters);
                    break;
                case 'orWhere':
                    this.queryBuilder = this.queryBuilder.orWhere(condition.condition, condition.parameters);
                    break;
            }
        });

        // 应用排序
        this.orderByClauses.forEach(clause => {
            this.queryBuilder = this.queryBuilder.addOrderBy(
                `${this.alias}.${clause.property}`,
                clause.direction
            );
        });

        // 应用分页
        if (this.skipValue !== undefined
        ) {
            this.queryBuilder = this.queryBuilder.skip(this.skipValue);
        }

        if (this.takeValue !== undefined) {
            this.queryBuilder = this.queryBuilder.take(this.takeValue);
        }

        // 应用关联查询
        this.relations.forEach(relation => {
            this.queryBuilder = this.queryBuilder.leftJoinAndSelect(
                `${this.alias}.${relation}`,
                relation
            );
        });
    }
}

export interface ILinqRepository<T extends ObjectLiteral>

    extends Repository<T> {
    linq()
        :
        ILinqQuery<T>;
}

export class LinqRepository<T extends ObjectLiteral> extends Repository<T> implements ILinqRepository<T> {
    linq(): ILinqQuery<T> {
        return new LinqQueryBuilder<T>(this);
    }
}

export function createLinqRepository<T extends ObjectLiteral>(
    repository: Repository<T>
): ILinqRepository<T> {
    return Object.assign(repository, {
        linq(): ILinqQuery<T> {
            return new LinqQueryBuilder(repository);
        }
    });
}
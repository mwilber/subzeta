export type DataSourceKey = string | number | symbol | null;
export interface DataSource {
    [index: string]: any;
    [index: number]: any;
}
export type DataSourceArray<T> = Array<unknown> & T;
export type ProxyDataSource<T> = {
    [K in keyof T]: ReactiveProxy<T[K]> | T[K];
};
export interface ArrowTemplate {
    (parent?: ParentNode): ParentNode;
    isT: boolean;
    key: (key: ArrowTemplateKey) => void;
    _h: () => [
        html: string,
        expressions: ReactiveExpressions,
        key: ArrowTemplateKey
    ];
    _k?: ArrowTemplateKey;
}
type ArrowTemplateKey = string | number | undefined;
export type ArrowFragment = {
    <T extends ParentNode>(parent: T): T;
    (): DocumentFragment;
};
export interface ReactiveFunction {
    (el?: Node): string | ArrowTemplate;
    (ev: Event, listener: EventListenerOrEventListenerObject): void;
    $on: (observer: CallableFunction) => void;
    _up: (newExpression: CallableFunction) => void;
    e: CallableFunction;
}
export interface ObserverCallback {
    (value?: any, oldValue?: any): void;
}
export interface DependencyProps {
    $on: (p: DataSourceKey, c: ObserverCallback) => void;
    $off: (p: DataSourceKey, c: ObserverCallback) => void;
    _em: (p: DataSourceKey, newValue: any, oldValue?: any) => void;
    _st: () => ReactiveProxyState;
    _p?: ReactiveProxyParent;
}
export type ReactiveProxy<T> = {
    [K in keyof T]: T[K] extends DataSource ? ReactiveProxy<T[K]> : T[K];
} & DataSource & DependencyProps;
type ReactiveProxyParent = [
    property: DataSourceKey,
    parent: ReactiveProxy<DataSource>
];
export type ReactiveExpressions = Array<ReactiveFunction>;
type ReactiveProxyObservers = Map<DataSourceKey, Set<ObserverCallback>>;
type ReactiveProxyPropertyObservers = Map<ObserverCallback, Set<DataSourceKey>>;
export type ParentNode = Element | DocumentFragment;
interface ReactiveProxyState {
    o?: ReactiveProxyObservers;
    op?: ReactiveProxyPropertyObservers;
    r?: DataSource;
    p?: ReactiveProxyParent;
}
export type RenderGroup = ArrowTemplate | ArrowTemplate[] | Node | Node[] | string[];
export interface TemplatePartial {
    (): DocumentFragment;
    /**
     * Adds a template or string to the partials chunks.
     * @param tpl - A template or string to render.
     * @returns
     */
    add: (tpl: ArrowTemplate | number | string) => void;
    /**
     * Update the partial.
     */
    _up: () => void;
    /**
     * Length — the number of html elements.
     */
    l: number;
    /**
     * Returns partial chunks of a render group.
     * @returns
     */
    ch: () => PartialChunk[];
}
type PartialChunk = {
    html: string;
    exp: ReactiveFunction[];
    dom: ChildNode[];
    tpl: ArrowTemplate | string;
    key: ArrowTemplateKey;
};
/**
 * Adds the ability to listen to the next tick.
 * @param  {CallableFunction} fn?
 * @returns Promise
 */
export declare function nextTick(fn?: CallableFunction): Promise<unknown>;
/**
 * The template tagging function, used like: t`<div></div>`(mountEl)
 * @param  {TemplateStringsArray} strings
 * @param  {any[]} ...expressions
 * @returns ArrowTemplate
 */
export declare function t(strings: TemplateStringsArray, ...expSlots: any[]): ArrowTemplate;
/**
 * Watch a function and track any reactive dependencies on it, re-calling it if
 * those dependencies are changed.
 * @param  {CallableFunction} fn
 * @param  {CallableFunction} after?
 * @returns unknown
 */
export declare function w(fn: CallableFunction, after?: CallableFunction): unknown;
/**
 * Given a data object, often an object literal, return a proxy of that object
 * with mutation observers for each property.
 *
 * @param  {DataSource} data
 * @returns ReactiveProxy
 */
export declare function r<T extends DataSource>(data: T, state?: ReactiveProxyState): ReactiveProxy<T>;
export declare const html: typeof t;
export declare const reactive: typeof r;
export declare const watch: typeof w;
export {};

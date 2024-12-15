import deepmerge from 'deepmerge';

export type StoreScope = 'local' | 'session' | 'onetime';

export type StoreDef = Record<string, {
    default: any;
    scope: StoreScope;
}>;

export type StoreState<T extends StoreDef> = { [K in keyof T]: T[K]['default']; };

const PREFIX = 'pizzax::';

export class Store<T extends StoreDef> {
    public readonly key: string;
    public readonly storageKeyNameBase: `pizzax::${this['key']}` | '';

    public readonly def: T;

    public readonly state: StoreState<T>;

    public readonly localStorage = window.localStorage;
    public readonly sessionStorage = window.sessionStorage;
    public readonly oneTimeStorage = new Map<string, string>();

    constructor(key: string, def: T) {
        this.key = key;
        this.storageKeyNameBase = `${PREFIX}${key}`;

        this.def = def;

        this.state = {} as StoreState<T>;

        for (const k in def) {
            const item = this.getItemRaw(`${this.storageKeyNameBase}::${k}`, def[k]!.scope);
            if (item) {
                const merged = typeof JSON.parse(item) === 'object' ? deepmerge(def[k]!.default, JSON.parse(item)) : JSON.parse(item);
                this.state[k] = merged;
            } else {
                this.state[k] = def[k]!.default;
            }
        }
    }

    protected getItemRaw(key: string, storage: StoreScope = 'local') {
        if (storage === 'local') {
            return this.localStorage.getItem(key);
        } else if (storage === 'session') {
            return this.sessionStorage.getItem(key);
        } else if (storage === 'onetime') {
            return this.oneTimeStorage.get(key);
        } else {
            throw new Error('Invalid storage scope');
        }
    }

    /** 将来的にAPIコールなどができるようにするため、非同期にしておく */
    protected async setItemRaw(key: string, value: string, storage: StoreScope = 'local') {
        if (storage === 'local') {
            this.localStorage.setItem(key, value);
        } else if (storage === 'session') {
            this.sessionStorage.setItem(key, value);
        } else if (storage === 'onetime') {
            this.oneTimeStorage.set(key, value);
        }
    }

    /** 値をセットする */
    public async set<K extends keyof T>(key: K, value: T[K]['default']) {
        this.state[key] = value;
        await this.setItemRaw(`${this.storageKeyNameBase}::${String(key)}`, JSON.stringify(value), this.def[key]!.scope);
    }

    /** 値を取得する */
    public get<K extends keyof T>(key: K) {
        return this.state[key];
    }

    /** 値を初期値に戻す */
    public reset<K extends keyof T>(key: K) {
        this.set(key, this.def[key]!.default);
    }
}

import deepmerge from 'deepmerge';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { Store as StoreCore } from '../index';
import type { StoreDef } from '../index';

type WritableState<T extends StoreDef> = { [K in keyof T]: Writable<T[K]['default']>; };

export class Store<T extends StoreDef> extends StoreCore<T> {
    public readonly writableState: WritableState<T>;

    constructor(key: string, def: T) {
        super(key, def);

        this.writableState = {} as WritableState<T>;

        for (const k in def) {
            const item = this.getItemRaw(`${this.storageKeyNameBase}::${k}`, def[k]!.scope);
            if (item) {
                const merged = typeof JSON.parse(item) === 'object' ? deepmerge(def[k]!.default, JSON.parse(item)) : JSON.parse(item);
                this.writableState[k] = this.createWritable(k, merged);
            } else {
                this.writableState[k] = this.createWritable(k, def[k]!.default);
            }
        }
    }

    private createWritable<K extends keyof T>(key: K, def: T[K]['default']): Writable<T[K]['default']> {
        const { subscribe, set, update } = writable(def);
        
        return {
            subscribe,
            set: (value: T[K]['default']) => {
                set(value);
                this.set<K>(key, value);
            },
            update: (fn: (value: T[K]['default']) => T[K]['default']) => {
                update(fn);
                this.set<K>(key, fn(this.get(key)));
            },
        }
    }

    public async set<K extends keyof T>(key: K, value: T[K]['default']) {
        this.writableState[key].set(value);
        await super.set(key, value);
    }
}

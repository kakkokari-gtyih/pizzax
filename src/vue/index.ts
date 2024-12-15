import deepmerge from 'deepmerge';
import { Store as StoreCore } from '../index';
import type { StoreDef } from '../index';
import { onUnmounted, ref, watch } from 'vue';
import type { Ref } from 'vue';

type ReactiveState<T extends StoreDef> = { [K in keyof T]: Ref<T[K]['default']>; };

export class Store<T extends StoreDef> extends StoreCore<T> {
    public readonly reactiveState: ReactiveState<T>;

    constructor(key: string, def: T) {
        super(key, def);

        this.reactiveState = {} as ReactiveState<T>;

        for (const k in def) {
            const item = this.getItemRaw(`${this.storageKeyNameBase}::${k}`, def[k]!.scope);
            if (item) {
                const merged = typeof JSON.parse(item) === 'object' ? deepmerge(def[k]!.default, JSON.parse(item)) : JSON.parse(item);
                this.reactiveState[k] = ref(merged);
            } else {
                this.reactiveState[k] = ref(def[k]!.default);
            }
        }
    }
    
    public async set<K extends keyof T>(key: K, value: T[K]['default']) {
        this.reactiveState[key].value = value;
        await super.set(key, value);
    }

    public makeGetterSetter<K extends keyof T, G extends unknown>(key: K, getter?: () => G, setter?: (value: G) => T[K]['default']): {
        get: () => T[K]['default'];
        set: (value: T[K]['default']) => void;
    } {
        const valueRef = ref(this.state[key]);
        const watchStop = watch(this.reactiveState[key], (value) => {
            valueRef.value = value;
        });

        onUnmounted(() => {
            watchStop();
        });

        return {
            get: () => {
                return getter ? getter() : valueRef.value;
            },
            set: (value: T[K]['default']) => {
                const newValue = setter ? setter(value) : value;
                this.set(key, newValue);
                valueRef.value = newValue;
            },
        };
    }
}

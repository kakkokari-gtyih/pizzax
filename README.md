# pizzax

フレームワークを問わず使えるシンプルな状態管理ライブラリになる予定のものです。

> [!NOTE]
> Misskey内部で使われているpizzaxと設計は似通っていますが、別物です。

## インストール

※まだありません

```bash
npm install pizzax
```

## 使い方

### Plain JavaScript

`/store.ts` のようなstore定義用のファイルを作成します。

```ts
import { Store } from 'pizzax';

export const mainStore = new Store('storeKey', {
    count: {
        default: 0,
        scope: 'onetime' // 再読み込みで消える（インメモリ）
    },
    name: {
        default: 'John Doe',
        scope: 'session' // sessionStorageに保存
    },
    colorMode: {
        default: 'dark' as 'dark' | 'light', // アサーションを使って型を指定できる
        scope: 'local' // localStorageに保存
    },
});
```

`store.ts` を読み込んで使います。

```ts
import { mainStore } from './store';

store.set('count', 1);

console.log(store.state.count); // 1

console.log(store.get('name')); // John Doe
```

### Vue

Vueで使う場合は、インポート先を `pizzax/vue` に変更します。

```ts
import { Store } from 'pizzax/vue';

export const mainStore = new Store('storeKey', {
    // ...
});
```

Vueの場合は、通常の `state` だけでなく、 `reactiveState` 経由でリアクティブに状態を取得できます。

```vue
<template>
    <div>
        <p>こんにちは、 {{ mainStore.reactiveState.name.value }} さん！</p>
    </div>
</template>

<script setup lang="ts">
import { mainStore } from './store';
</script>
```

さらに、 `computed` に `makeGetterSetter` を渡すと、状態をリアクティブに取得・更新できます。

```vue
<template>
    <div>
        <p>{{ count }}</p>
        <button @click="increment">Increment</button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { mainStore } from './store';

const count = computed(mainStore.makeGetterSetter('count'));

function increment() {
    count.value++;
}
</script>
```

### React

WIP

## ライセンス

MITになる予定

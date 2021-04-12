<template>
    <q-chip
        style="max-width: 175px"
        clickable
        v-for="c in categories"
        :key="c.id"
        :selected="modelValue[c.id]"
        @update:selected="updateValue(c.id, $event)"
    >
        <div class="ellipsis">
            {{ c.name }}
            <q-tooltip> {{ c.name }} </q-tooltip>
        </div>
    </q-chip>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Category } from "@/store/types";

export default defineComponent({
    name: "CategoryChips",
    emits: ["update:modelValue"],
    props: {
        modelValue: {
            type: Object as PropType<{ [key: string]: boolean }>,
        },
        categories: {
            type: Array as PropType<Array<Category>>,
            default: [],
        },
    },
    setup: (props, ctx) => {
        const updateValue = (id: string, val: boolean) => {
            if (!props.modelValue) return;
            ctx.emit("update:modelValue", {
                ...Object.entries(props.modelValue)
                    .filter((v) => !!v[1])
                    .reduce((acc, kv) => (acc = { ...acc, [kv[0]]: kv[1] }), {}),
                [id]: val,
            });
        };

        return { updateValue };
    },
});
</script>

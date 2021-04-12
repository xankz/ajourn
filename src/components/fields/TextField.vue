<template>
    <div v-if="editView">
        <q-input
            label="Content"
            outlined
            dense
            :modelValue="modelValue.content"
            @update:modelValue="updateValue"
        ></q-input>
    </div>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <div class="text-body2">{{ modelValue.content }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Entry, Field, FieldType, TextField } from "@/store/types";

export default defineComponent({
    name: "TextField",
    emits: ["update:modelValue"],
    props: {
        modelValue: {
            type: Object as PropType<Field>,
            required: true,
        },
        editView: {
            type: Boolean,
            default: false,
        },
        entry: {
            type: Object as PropType<Entry>,
            required: true,
        },
    },
    setup: (props, { emit }) => {
        const updateValue = (content: string) => {
            emit("update:modelValue", { ...props.modelValue, content } as TextField);
        };

        return {
            FieldType,
            updateValue,
        };
    },
});
</script>

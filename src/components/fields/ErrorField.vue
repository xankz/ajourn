<template>
    <div class="text-subtitle2 q-mb-xs text-negative">Error loading field!</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Entry, Field, FieldType, TextField } from "@/store/types";

export default defineComponent({
    name: "ErrorField",
    emits: ["update:modelValue"],
    props: {
        modelValue: {
            type: Object as PropType<Field>,
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

<template>
    <div v-if="editView">
        <q-input
            label="Value"
            type="number"
            outlined
            dense
            :modelValue="modelValue.value"
            @update:modelValue="updateValue"
        ></q-input>
    </div>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <div class="text-body1">{{ modelValue.value }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Entry, Field, FieldType, NumberField } from "@/store/types";

export default defineComponent({
    name: "NumberField",
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
        const updateValue = (value: string) => {
            emit("update:modelValue", {
                ...props.modelValue,
                value: Number.parseInt(value),
            } as NumberField);
        };

        return {
            FieldType,
            updateValue,
        };
    },
});
</script>

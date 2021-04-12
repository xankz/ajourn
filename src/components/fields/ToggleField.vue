<template>
    <div v-if="editView">
        <q-checkbox
            :modelValue="modelValue.value"
            @update:modelValue="updateValue"
            style="transform: translateX(-10px)"
        >
            <slot v-if="modelValue.value">
                On<span class="text-italic text-grey q-ml-sm">"{{ modelValue.whenTrue }}"</span>
            </slot>
            <slot v-else>
                Off<span class="text-italic text-grey q-ml-sm">"{{ modelValue.whenFalse }}"</span>
            </slot>
        </q-checkbox>
        <q-input
            label="When on"
            outlined
            class="q-mt-md"
            dense
            :modelValue="modelValue.whenTrue"
            @update:modelValue="updateWhenTrue"
        ></q-input>
        <q-input
            label="When off"
            outlined
            dense
            class="q-mt-sm"
            :modelValue="modelValue.whenFalse"
            @update:modelValue="updateWhenFalse"
        ></q-input>
    </div>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <div class="text-body2">
            {{ modelValue.value ? modelValue.whenTrue : modelValue.whenFalse }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Entry, FieldType, ToggleField } from "@/store/types";

export default defineComponent({
    name: "ToggleField",
    emits: ["update:modelValue"],
    props: {
        modelValue: {
            type: Object as PropType<ToggleField>,
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
        const updateValue = (value: boolean) => {
            emit("update:modelValue", { ...props.modelValue, value });
        };
        const updateWhenTrue = (whenTrue: string) => {
            emit("update:modelValue", { ...props.modelValue, whenTrue });
        };
        const updateWhenFalse = (whenFalse: string) => {
            emit("update:modelValue", { ...props.modelValue, whenFalse });
        };

        return {
            FieldType,
            updateValue,
            updateWhenTrue,
            updateWhenFalse,
        };
    },
});
</script>

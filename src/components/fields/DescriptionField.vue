<template>
    <div v-if="editView">
        <q-editor
            dense
            :modelValue="modelValue.content"
            @update:modelValue="updateValue"
            class="q-mt-md"
            max-height="200px"
            :toolbar="[
                ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'],
                ['undo', 'redo'],
                ['removeFormat'],
            ]"
        ></q-editor>
    </div>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <div
            v-if="modelValue.content"
            class="text-body2"
            v-html="modelValue.content"
            style="word-wrap: break-word"
        ></div>
        <div class="text-subtitle2 text-grey" v-else>No content for this field.</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { DescriptionField, Entry, Field, FieldType } from "@/store/types";

export default defineComponent({
    name: "DescriptionField",
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
            emit("update:modelValue", { ...props.modelValue, content } as DescriptionField);
        };

        return {
            FieldType,
            updateValue,
        };
    },
});
</script>

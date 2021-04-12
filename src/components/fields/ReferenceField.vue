<template>
    <div v-if="editView">
        <q-select
            label="Categories"
            outlined
            dense
            multiple
            :modelValue="modelValue.categories"
            @update:modelValue="updateCategories"
            :options="categories"
            class="q-mt-md"
            new-value-mode="add-unique"
            option-label="name"
            options-dense
            option-value="id"
            emit-value
            map-options
            use-chips
        >
            <template v-slot:no-option>
                <q-item dense>
                    <q-item-section class="text-italic text-grey"> No categories </q-item-section>
                </q-item>
            </template>
        </q-select>
        <select-entry
            multiple
            :modelValue="modelValue.entries"
            @update:modelValue="updateEntries"
            outlined
            dense
            class="q-mt-sm"
            options-dense
            label="Entries"
        ></select-entry>
    </div>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <q-list bordered separator class="rounded-borders">
            <entry-link v-for="e in entryReferences" :entryId="e" :key="e" item></entry-link>
        </q-list>
    </div>
</template>

<script lang="ts">
import { intersection } from "lodash";
import { computed, defineComponent, PropType, watch, watchEffect } from "vue";

import { useStore } from "@/store";
import {
    API_FETCH_ENTRIES,
    API_FETCH_ENTRY,
    Entry,
    FieldType,
    ReferenceField,
    TextField,
} from "@/store/types";

import EntryLink from "../EntryLink.vue";
import SelectEntry from "../form/SelectEntry.vue";

export default defineComponent({
    name: "ReferenceField",
    emits: ["update:modelValue"],
    components: { SelectEntry, EntryLink },
    props: {
        modelValue: {
            type: Object as PropType<ReferenceField>,
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
        // Providers
        const $store = useStore();

        // Computed
        const journalCategories = computed(() =>
            $store.state.currentJournal
                ? $store.state.journals[$store.state.currentJournal].categories
                : []
        );
        const categories = computed(() =>
            props.entry.category
                .map((c) => journalCategories.value.find((c2) => c2.id === c))
                .filter((c) => c !== undefined)
        );
        const entryReferences = computed(() =>
            Object.values($store.state.entries)
                .filter(
                    (e) =>
                        intersection(e.category, props.modelValue.categories).length ||
                        props.modelValue.entries.includes(e.id)
                )
                .map((e) => e.id)
        );

        // Functions
        const updateCategories = (catg: string[]) => {
            emit("update:modelValue", { ...props.modelValue, categories: catg } as ReferenceField);
        };
        const updateEntries = (entr: string[]) => {
            emit("update:modelValue", { ...props.modelValue, entries: entr } as ReferenceField);
        };

        // Effects
        watchEffect(() => {
            if (!props.editView) {
                props.modelValue.categories.forEach(
                    async (c) =>
                        await $store.dispatch(API_FETCH_ENTRIES, { category: c, flush: false })
                );
                props.modelValue.entries.forEach(
                    async (e) => await $store.dispatch(API_FETCH_ENTRY, { id: e })
                );
            }
        });

        return {
            FieldType,
            categories,
            updateCategories,
            updateEntries,
            entryReferences,
        };
    },
});
</script>

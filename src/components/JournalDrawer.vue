<template>
    <q-input
        standout="bg-primary text-white"
        class="q-px-md q-mt-lg"
        label="Search"
        v-model="entrySearch"
        dense
        clearable
    ></q-input>
    <q-separator class="q-mt-md"></q-separator>
    <q-list padding>
        <template v-if="lastEntry">
            <q-item-label header>Last viewed entry</q-item-label>
            <entry-link :entryId="lastEntry" item></entry-link>
            <q-separator class="q-mt-md q-mb-sm"></q-separator>
        </template>
        <q-item-label header class="row justify-between items-center full-width q-pb-md">
            Categories
            <div>
                <q-btn
                    round
                    icon="clear"
                    text-color="red"
                    class="q-mr-sm"
                    size="sm"
                    v-if="filteredCategories.length"
                    @click="entryCategoryFilter = {}"
                >
                    <q-tooltip>Clear category filter</q-tooltip>
                </q-btn>
                <q-btn round icon="settings" class="self-end" size="sm" @click="openCreateCategory">
                    <q-tooltip>Manage categories</q-tooltip>
                </q-btn>
            </div>
        </q-item-label>
        <q-item v-if="categories.length" class="q-pt-none q-mb-sm" style="flex-wrap: wrap">
            <category-chips :categories="categories" v-model="entryCategoryFilter"></category-chips>
        </q-item>
        <q-item v-else class="text-grey">There are no categories in this journal.</q-item>
        <q-separator></q-separator>
        <q-item-label header class="row justify-between items-center full-width q-mt-sm">
            Entries
            <q-btn
                round
                icon="add"
                text-color="primary"
                class="self-end"
                size="sm"
                @click="openCreateEntry"
            >
                <q-tooltip>Create a new entry</q-tooltip>
            </q-btn>
        </q-item-label>
        <template v-if="filteredEntries.length">
            <q-item
                v-for="e in filteredEntries"
                :key="e.id"
                :to="'/j/' + currentJournal + '/e/' + e.id"
            >
                <q-item-section avatar>
                    <q-icon
                        v-if="e.avatar.type == 'icon'"
                        :name="e.avatar.data"
                        color="primary"
                    ></q-icon>
                    <q-img
                        ratio="1"
                        v-else
                        :src="getEntryAvatar(e.id, e.avatar.data)"
                        class="rounded-borders"
                    ></q-img>
                </q-item-section>
                <q-item-section v-if="e.title">
                    {{ e.title }}
                </q-item-section>
                <q-item-section v-else class="text-grey text-italic">
                    Untitled entry
                </q-item-section>
            </q-item>
        </template>
        <q-item v-else-if="filteredEntries.length == 0 && entrySearch">
            <q-item-label caption>No results for "{{ entrySearch }}".</q-item-label>
        </q-item>
        <q-item v-if="entries.length <= 0">
            <q-item-label caption>There are no entries in this journal.</q-item-label>
        </q-item>
    </q-list>
</template>

<script lang="ts">
import { intersection, xor } from "lodash";
import { useQuasar } from "quasar";
import { computed, defineComponent, PropType, ref } from "vue";

import CreateEntryDialog from "@/components/CreateEntryDialog.vue";
import { useStore } from "@/store";
import { Category, Entry } from "@/store/types";

import CategoryChips from "./CategoryChips.vue";
import EntryLink from "./EntryLink.vue";
import ManageCategoriesDialog from "./ManageCategoriesDialog.vue";

export default defineComponent({
    name: "JournalDrawer",
    components: { EntryLink, CategoryChips },
    setup: (props) => {
        // Providers
        const $q = useQuasar();
        const $store = useStore();

        // Refs
        const entrySearch = ref("");
        const entryCategoryFilter = ref<{ [key: string]: boolean }>({});

        // Computed
        const lastEntry = computed(() =>
            $store.state.entries[$store.state.lastEntry] ? $store.state.lastEntry : undefined
        );
        const categories = computed(() =>
            $store.state.currentJournal
                ? $store.state.journals[$store.state.currentJournal].categories
                : []
        );
        const filteredCategories = computed(() =>
            Object.entries(entryCategoryFilter.value)
                .filter((kv) => kv[1])
                .map((kv) => kv[0])
        );
        const filteredEntries = computed(() =>
            Object.values(props.entries)
                .filter((e) => (entrySearch.value ? e.title.includes(entrySearch.value) : true))
                .filter((e) => {
                    if (!filteredCategories.value.length) {
                        return true;
                    }
                    // return xor(filteredCategories, e.category).length === 0;
                    return filteredCategories.value.every((fc) => e.category.includes(fc));
                })
        );

        // Functions
        const openCreateEntry = () => {
            $q.dialog({ component: CreateEntryDialog });
        };
        const openCreateCategory = () => {
            $q.dialog({ component: ManageCategoriesDialog });
        };
        const getEntryAvatar = (id: string, name: string) => {
            return $store.getters.entryAttachment(id, name);
        };

        return {
            openCreateEntry,
            getEntryAvatar,
            lastEntry,
            openCreateCategory,
            entrySearch,
            categories,
            filteredEntries,
            entryCategoryFilter,
            filteredCategories,
        };
    },
    props: {
        currentJournal: {
            type: String,
        },
        entries: {
            type: Object as PropType<{ [key: string]: Entry }>,
            default: {},
        },
    },
});
</script>

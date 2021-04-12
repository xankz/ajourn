<template>
    <template v-if="item && entry && currentJournal">
        <q-item :to="'/j/' + currentJournal + '/e/' + entry.id">
            <q-item-section avatar>
                <q-avatar rounded v-if="entryAvatar.type === 'attachment'" :size="avatarSize">
                    <img :src="entryAvatar.data" />
                </q-avatar>
                <q-avatar
                    v-else
                    text-color="primary"
                    rounded
                    :icon="entryAvatar.data"
                    :size="avatarSize"
                ></q-avatar>
            </q-item-section>
            <q-item-section v-if="entry.title">
                {{ entry.title }}
            </q-item-section>
            <q-item-section v-else class="text-grey text-italic"> Untitled entry </q-item-section>
        </q-item>
    </template>
    <div v-else-if="entry && currentJournal">
        <div class="row">
            <div class="col-auto q-mr-md">
                <q-avatar rounded v-if="entryAvatar.type === 'attachment'" :size="avatarSize">
                    <img :src="entryAvatar.data" />
                </q-avatar>
                <q-avatar
                    v-else
                    text-color="primary"
                    rounded
                    :icon="entryAvatar.data"
                    :size="avatarSize"
                ></q-avatar>
            </div>
            <div class="col">
                <div class="text-h6" style="line-height: 1.2em">{{ entry.title }}</div>
                <router-link
                    :to="'/j/' + currentJournal + '/e/' + entryId"
                    style="text-decoration: none"
                    class="text-subtitle2"
                    v-if="showLink"
                >
                    View entry
                </router-link>
            </div>
        </div>
    </div>
    <div class="text-subtitle2 q-mb-xs text-negative" v-else>Error loading link!</div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watchEffect } from "vue";

import { useStore } from "@/store";
import { API_FETCH_ENTRY } from "@/store/types";

export default defineComponent({
    name: "EntryLink",
    props: {
        entryId: {
            type: String,
            required: true,
        },
        showLink: {
            type: Boolean,
            default: true,
        },
        item: {
            type: Boolean,
            default: false,
        },
        avatarSize: {
            type: String,
        },
    },
    setup: (props) => {
        // Providers
        const $store = useStore();

        // Computed
        const entry = computed(() => $store.state.entries[props.entryId]);
        const entryAvatar = computed(() => {
            if (entry.value) {
                return {
                    data:
                        entry.value.avatar.type === "attachment"
                            ? $store.getters.entryAttachment(
                                  entry.value.id,
                                  entry.value.avatar.data as string
                              )
                            : entry.value.avatar.data,
                    type: entry.value.avatar.type,
                };
            }
            return undefined;
        });
        const currentJournal = computed(() => $store.state.currentJournal);

        return { entry, entryAvatar, currentJournal };
    },
});
</script>

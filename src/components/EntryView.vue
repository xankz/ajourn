<template>
    <div class="row">
        <q-card class="col col-md-5">
            <q-item class="q-my-sm">
                <q-item-section avatar v-if="entry">
                    <q-avatar size="64px" rounded v-if="entry.avatar.type == 'icon'">
                        <q-icon :name="entry.avatar.data" color="primary"></q-icon>
                    </q-avatar>
                    <q-img
                        v-else
                        :src="entryAvatar"
                        :ratio="1"
                        :style="{ width: '64px', height: '64px' }"
                        class="rounded-borders cursor-pointer"
                        loading="lazy"
                        @click="previewAvatar"
                    />
                </q-item-section>

                <q-item-section v-if="entry">
                    <div class="text-h5" :style="{ lineHeight: '1.25em' }">{{ entry.title }}</div>
                </q-item-section>
            </q-item>
            <q-separator :class="{ 'q-mt-md': categories.length }"></q-separator>
            <q-card-section class="q-pt-sm q-px-none q-pb-none">
                <!-- <q-btn
                    size="10px"
                    icon="expand_more"
                    color="white"
                    text-color="dark"
                    class="absolute"
                    style="top: 0; right: 16px; transform: translateY(-50%); padding: 4px 8px"
                >
                    <q-tooltip>More settings</q-tooltip>
                </q-btn>
                <q-btn
                    size="10px"
                    label="Edit"
                    color="white"
                    text-color="dark"
                    class="absolute text-weight-bold"
                    @click="editEntry"
                    style="top: 0; right: calc(16px + 33px + 8px); transform: translateY(-50%)"
                >
                    <q-tooltip>Edit "{{ entry.title }}"</q-tooltip>
                </q-btn> -->
                <div
                    class="absolute row"
                    style="
                        top: 0;
                        left: 16px;
                        transform: translateY(-50%);
                        width: calc(100% - 32px);
                    "
                >
                    <div class="col q-mr-md">
                        <div class="ellipsis" style="padding: 4px 0" v-if="categories.length">
                            <q-badge
                                ref="categoryBadgeRef"
                                class="text-weight-bold shadow-2 q-mr-sm"
                                :style="{
                                    backgroundColor: c.color,
                                    color: getCategoryTextColor(c.color),
                                    borderColor: getCategoryBorderColor(c.color),
                                }"
                                v-for="c in categories"
                                :key="c.id"
                                style="
                                    padding: 6px 8px;
                                    font-size: 12px;
                                    border-width: 1px;
                                    border-style: solid;
                                    max-width: 200px;
                                "
                            >
                                <div class="ellipsis">
                                    {{ c.name }}
                                </div>
                            </q-badge>
                        </div>
                    </div>

                    <div class="col-auto">
                        <q-btn-dropdown
                            size="10px"
                            class="edit self-end"
                            color="white"
                            text-color="dark"
                            split
                            label="Edit"
                            @click="editEntry"
                            style="margin: 4px 0"
                        >
                            <q-list dense>
                                <q-item clickable v-close-popup @click="viewAttachments">
                                    <q-item-section avatar style="min-width: 0">
                                        <q-icon name="perm_media" size="16px"></q-icon>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>Attachments</q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-separator></q-separator>
                                <q-item clickable v-close-popup>
                                    <q-item-section avatar style="min-width: 0">
                                        <q-icon name="info_outline" size="16px"></q-icon>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>Info</q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-item
                                    clickable
                                    v-close-popup
                                    class="text-negative"
                                    @click="deleteEntry"
                                >
                                    <q-item-section avatar style="min-width: 0">
                                        <q-icon name="delete_outline" size="16px"></q-icon>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>Delete</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-btn-dropdown>
                    </div>
                </div>
            </q-card-section>
            <q-card-section v-if="entry && entry.fields.length">
                <component
                    v-for="(f, i) in entry.fields"
                    :is="getComponentFromField(f)"
                    :modelValue="f"
                    :key="f ? f.id : i"
                    :editView="false"
                    :entry="entry"
                    :class="{ 'q-mb-sm': i != entry.fields.length - 1 }"
                ></component>
            </q-card-section>
            <q-card-section v-else class="text-subtitle1 text-grey-8">
                No fields for this entry.
            </q-card-section>
        </q-card>
    </div>
</template>

<script lang="ts">
import * as _ from "lodash";
import { colors, QBadge, useQuasar } from "quasar";
import { computed, defineComponent, ref } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";

import { FieldDefs } from "@/constants";
import { useStore } from "@/store";
import { API_DELETE_ENTRY, API_SET_LAST_ENTRY, Field, SET_LAST_ENTRY } from "@/store/types";
import { b64 } from "@/utils";

import PreviewAttachmentDialog from "./attachments/PreviewAttachmentDialog.vue";
import ViewAttachmentsDialog from "./attachments/ViewAttachmentsDialog.vue";
import DeleteEntryDialog from "./DeleteEntryDialog.vue";
import EditEntryDialog from "./EditEntryDialog.vue";
import ErrorField from "./fields/ErrorField.vue";

export default defineComponent({
    name: "EntryView",
    setup: () => {
        const $store = useStore();
        const $route = useRoute();
        const $router = useRouter();
        const $q = useQuasar();

        const state = {
            entry: computed(() => $store.state.entries[$route.params.eid as string]),
        };

        const journalCategories = computed(() =>
            $store.state.currentJournal
                ? $store.state.journals[$store.state.currentJournal].categories
                : []
        );
        const categories = computed(() =>
            state.entry.value
                ? state.entry.value.category
                      .map((c) => journalCategories.value.find((c2) => c2.id === c))
                      .filter((c) => c !== undefined)
                : []
        );

        const categoryBadgeRef = ref<typeof QBadge | null>(null);
        const getCategoryTextColor = (color: string) => {
            return colors.brightness(color) < 128 ? "#fff" : "#1d1d1d";
        };

        const getCategoryBorderColor = (color: string) => {
            return colors.lighten(color, -25);
        };

        const getComponentFromField = (f: Field) => {
            if (!f || !_.has(f, "type") || !(f.type in FieldDefs)) {
                return ErrorField;
            }
            return FieldDefs[f.type].component;
        };

        const entryAvatar = computed(() => {
            return $store.getters.entryAttachment(
                state.entry.value.id,
                state.entry.value.avatar.data
            );
        });
        const previewAvatar = () => {
            if (!state.entry.value.attachments["avatar"]) {
                return;
            }
            $q.dialog({
                component: PreviewAttachmentDialog,
                componentProps: {
                    attachment: { ...state.entry.value.attachments["avatar"], name: "avatar" },
                    entryId: $route.params.eid,
                },
            });
        };
        const editEntry = () => {
            $q.dialog({
                component: EditEntryDialog,
                persistent: true,
                componentProps: {
                    entry: _.cloneDeep(state.entry.value),
                    entryID: $route.params.eid as string,
                },
            });
        };

        const deleteEntry = () => {
            $q.dialog({
                component: DeleteEntryDialog,
                componentProps: {
                    entry: state.entry.value,
                },
            }).onOk(async () => {
                try {
                    await $store.dispatch(API_DELETE_ENTRY, $route.params.eid);
                    $store.state.lastEntry = "";
                    $router.push(`/j/${$store.state.currentJournal}`);
                } catch (e) {
                    $q.notify({ message: e.message, type: "negative" });
                }
            });
        };

        const viewAttachments = () => {
            $q.dialog({
                component: ViewAttachmentsDialog,
                componentProps: {
                    // entry: state.entry.value,
                    entryId: $route.params.eid,
                },
            });
        };

        onBeforeRouteUpdate(() => {
            $store.dispatch(API_SET_LAST_ENTRY, state.entry.value.id);
        });

        return {
            ...state,
            editEntry,
            categories,
            deleteEntry,
            entryAvatar,
            viewAttachments,
            getComponentFromField,
            getCategoryTextColor,
            getCategoryBorderColor,
            previewAvatar,
            categoryBadgeRef,
        };
    },
});
</script>

<style lang="scss" scoped>
.edit ::v-deep(.q-btn-dropdown__arrow-container) {
    border-left: 1px solid rgba(0, 0, 0, 0.2);
}

.edit ::v-deep(.q-btn) {
    font-weight: bold;
}
</style>

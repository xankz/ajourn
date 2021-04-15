<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin" style="width: 800px">
            <q-card-section class="row align-items-center">
                <div class="text-h6">"{{ entry.title }}" - Attachments</div>
                <q-space></q-space>
                <q-btn
                    icon="add"
                    color="primary"
                    flat
                    round
                    dense
                    class="q-mr-sm"
                    @click="createAttachment"
                >
                    <q-tooltip>Create a new attachment</q-tooltip>
                </q-btn>
                <q-btn icon="close" flat round dense v-close-popup>
                    <q-tooltip>Close dialog</q-tooltip>
                </q-btn>
            </q-card-section>
            <q-card-section>
                <q-splitter v-model="splitVal" :limits="[40, 55]">
                    <template v-slot:before>
                        <q-list
                            separator
                            dense
                            v-if="!isEmpty(filteredAttachments)"
                            style="overflow: auto; height: 200px"
                        >
                            <q-item
                                clickable
                                v-ripple
                                v-for="(att, attName) in filteredAttachments"
                                :key="attName"
                                @click="setSelected(attName)"
                                :active="attName === selectedAttKey"
                            >
                                <q-item-section
                                    avatar
                                    class="q-pr-none"
                                    style="min-width: 0; width: 28px"
                                >
                                    <q-icon
                                        :name="getAttachmentIcon(att.content_type)"
                                        size="20px"
                                    ></q-icon>
                                </q-item-section>
                                <q-item-section class="ellipsis">
                                    {{ attName }}
                                </q-item-section>
                                <q-item-section side>
                                    <q-badge outline color="grey">
                                        {{ getExtension(att.content_type) || "?" }}
                                    </q-badge>
                                </q-item-section>
                            </q-item>
                        </q-list>
                        <div v-else class="text-grey q-pa-md">No attachments found.</div>
                    </template>
                    <template v-slot:after>
                        <template v-if="selectedAttKey && selectedAtt">
                            <q-splitter
                                horizontal
                                v-model="selectedAttSplitter"
                                :limits="[40, 60]"
                                style="height: 200px"
                            >
                                <template v-slot:before>
                                    <template v-if="selectedAtt.content_type === 'text/plain'">
                                        <div
                                            v-if="renderText(selectedAtt.data)"
                                            class="q-px-sm text-caption"
                                            style="line-height: 1.3em"
                                        >
                                            {{ renderText(selectedAtt.data) }}
                                        </div>
                                        <div v-else class="q-px-sm text-grey">Empty content</div>
                                    </template>
                                    <div v-else-if="selectedAtt.content_type.startsWith('audio')">
                                        <audio controls :src="selectedAttData"></audio>
                                    </div>
                                    <div v-else-if="selectedAtt.content_type.startsWith('image')">
                                        <q-img
                                            @click="zoomImage = true"
                                            :src="selectedAttData"
                                            class="cursor-pointer"
                                        ></q-img>
                                        <q-dialog v-model="zoomImage">
                                            <q-img :src="selectedAttData"></q-img>
                                        </q-dialog>
                                    </div>
                                    <div v-else-if="selectedAtt.content_type.startsWith('video')">
                                        <video controls :src="selectedAttData"></video>
                                    </div>
                                    <div v-else class="text-body text-grey q-px-sm">
                                        Unable to load preview
                                    </div>
                                </template>
                                <template v-slot:after>
                                    <q-markup-table flat dense>
                                        <tbody>
                                            <tr>
                                                <td class="text-left text-grey">Name</td>
                                                <td class="text-right">
                                                    {{ truncate(selectedAttKey, { length: 16 }) }}
                                                    <q-tooltip>{{ selectedAttKey }}</q-tooltip>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="text-left text-grey">Type</td>
                                                <td class="text-right">
                                                    {{
                                                        truncate(selectedAtt.content_type, {
                                                            length: 16,
                                                        })
                                                    }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="text-left text-grey">Size</td>
                                                <td class="text-right">
                                                    {{ humanStorageSize(selectedAtt.data.length) }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </q-markup-table>
                                    <div class="row justify-end">
                                        <q-btn
                                            round
                                            icon="mode_edit"
                                            class="q-mr-sm"
                                            size="12px"
                                            flat
                                            @click="replaceAttachment"
                                        >
                                            <q-tooltip>Replace "{{ selectedAttKey }}"</q-tooltip>
                                        </q-btn>
                                        <q-btn
                                            @click="deleteAttachment"
                                            round
                                            icon="delete_outline"
                                            color="negative"
                                            size="12px"
                                            flat
                                        >
                                            <q-tooltip>Delete "{{ selectedAttKey }}"</q-tooltip>
                                        </q-btn>
                                    </div>
                                </template>
                            </q-splitter>
                        </template>
                        <div v-else class="text-grey q-pa-md text-center">
                            No attachment selected.
                        </div>
                    </template>
                </q-splitter>
            </q-card-section>
            <q-card-actions align="left">
                <div class="text-body q-pl-md text-grey">
                    {{ filteredAttachmentsLen }} attachment{{
                        filteredAttachmentsLen === 1 ? "" : "s"
                    }}
                </div>
                <q-space></q-space>
                <q-btn flat color="primary" label="OK" @click="onOKClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { isEmpty, truncate } from "lodash";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as mime from "mime-types";
import { format, useDialogPluginComponent, useQuasar } from "quasar";
import { computed, defineComponent, onMounted, ref } from "vue";

import { useStore } from "@/store";
import {
    API_ADD_ENTRY_ATTACHMENT,
    API_DELETE_ENTRY_ATTACHMENT,
    API_FETCH_ENTRY,
    API_UPDATE_ENTRY,
    CreateAttachment,
    FieldType,
} from "@/store/types";
import { b64, getAttachmentIcon, renderText } from "@/utils";

import CreateAttachmentDialog from "./CreateAttachmentDialog.vue";
import DeleteAttachmentDialog from "./DeleteAttachmentDialog.vue";

export default defineComponent({
    name: "ViewAttachmentsDialog",
    props: {
        entryId: {
            type: String,
            required: true,
        },
    },

    emits: [...useDialogPluginComponent.emits],

    setup(props) {
        // Providers
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $q = useQuasar();
        const $store = useStore();

        // Refs
        const splitVal = ref(55);
        const selectedAttKey = ref("");
        const selectedAttSplitter = ref(30);
        const zoomImage = ref(false);

        // Computed
        const entry = computed(() => $store.state.entries[props.entryId]);
        const filteredAttachments = computed(() => entry.value.attachments);
        const filteredAttachmentsLen = computed(
            () => Object.keys(filteredAttachments.value).length
        );
        const selectedAtt = computed(
            () => entry.value.attachments[selectedAttKey.value] || undefined
        );
        const selectedAttData = computed(() =>
            selectedAtt.value
                ? b64(selectedAtt.value.content_type, selectedAtt.value.data as string)
                : undefined
        );

        // Functions
        const setSelected = (key: string) => {
            if (key in entry.value.attachments) {
                selectedAttKey.value = key;
            }
        };
        const createAttachment = () => {
            $q.dialog({
                component: CreateAttachmentDialog,
                componentProps: {
                    attachments: filteredAttachments,
                },
            }).onOk(async (attachment: CreateAttachment) => {
                if (!attachment) {
                    return;
                }
                try {
                    await $store.dispatch(API_ADD_ENTRY_ATTACHMENT, {
                        id: props.entryId,
                        attachment,
                    });
                    await $store.dispatch(API_FETCH_ENTRY, { id: props.entryId, force: true });
                    setSelected(attachment.name);
                    $q.notify({ message: "Attachment saved", type: "positive" });
                } catch (e) {
                    $q.notify({ message: e.message, type: "negative" });
                }
            });
        };
        const replaceAttachment = () => {
            $q.dialog({
                component: CreateAttachmentDialog,
                componentProps: {
                    attachments: entry.value.attachments,
                    replace: selectedAttKey.value,
                    replaceData:
                        selectedAtt.value.content_type === "text/plain"
                            ? renderText(selectedAtt.value.data as string)
                            : undefined,
                },
            }).onOk(async (attachment: CreateAttachment) => {
                if (!attachment) {
                    return;
                }
                try {
                    const oldAttName = selectedAttKey.value;
                    await $store.dispatch(API_DELETE_ENTRY_ATTACHMENT, {
                        id: props.entryId,
                        name: oldAttName,
                    });
                    await $store.dispatch(API_ADD_ENTRY_ATTACHMENT, {
                        id: props.entryId,
                        attachment,
                    });
                    setSelected(attachment.name);
                    $q.notify({ message: "Attachment updated", type: "positive" });
                    // Attempt to auto-fix references in fields
                    if (entry.value) {
                        const fields = entry.value.fields.map((f) => {
                            // TODO: Where/why does f.type get saved as string?
                            if (typeof f.type == "string") {
                                f.type = Number.parseInt(f.type);
                            }
                            switch (f.type) {
                                case FieldType.Attachments:
                                    f.attachments = f.attachments.map((a) => {
                                        return a == oldAttName ? attachment.name : a;
                                    });
                                    break;
                                case FieldType.Map:
                                    f.imageKey =
                                        f.imageKey == oldAttName ? attachment.name : f.imageKey;
                                    break;
                            }
                            return f;
                        });

                        // Update avatar attachment reference as well
                        if (
                            entry.value.avatar.type == "attachment" &&
                            entry.value.avatar.data == oldAttName
                        ) {
                            entry.value.avatar.data = attachment.name;
                        }
                        await $store.dispatch(API_UPDATE_ENTRY, {
                            id: props.entryId,
                            data: { ...entry.value, fields },
                        });
                    }
                } catch (e) {
                    $q.notify({ message: e.message, type: "negative" });
                }
            });
        };

        const deleteAttachment = () => {
            if (!selectedAttKey.value || !selectedAtt.value) {
                return;
            }
            $q.dialog({
                component: DeleteAttachmentDialog,
                componentProps: {
                    name: selectedAttKey.value,
                },
            }).onOk(async () => {
                try {
                    await $store.dispatch(API_DELETE_ENTRY_ATTACHMENT, {
                        id: props.entryId,
                        name: selectedAttKey.value,
                    });
                    selectedAttKey.value = "";
                    $q.notify({ message: "Attachment deleted", type: "positive" });
                } catch (e) {
                    $q.notify({ message: e.message, type: "negative" });
                }
            });
        };

        // Effects
        onMounted(() => {
            // Fetch entry
        });

        return {
            dialogRef,
            onDialogHide,

            splitVal,
            filteredAttachments,
            filteredAttachmentsLen,
            createAttachment,
            getAttachmentIcon,
            selectedAtt,
            selectedAttKey,
            setSelected,
            entry,
            renderText,
            deleteAttachment,
            isEmpty,
            selectedAttSplitter,
            truncate,
            zoomImage,
            selectedAttData,
            getExtension: mime.extension,
            replaceAttachment,
            humanStorageSize: format.humanStorageSize,
            b64,

            onOKClick() {
                onDialogOK();
            },

            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
        };
    },
});
</script>

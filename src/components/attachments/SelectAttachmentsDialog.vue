<template>
    <!-- notice dialogRef here -->
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section class="row align-items-center">
                <div class="text-h6">
                    Select attachment
                    <span v-if="selected.length">({{ selected.length }})</span>
                </div>
                <q-space></q-space>
                <q-btn icon="add" color="primary" flat round dense @click="createAttachment">
                    <q-tooltip>Create a new attachment</q-tooltip>
                </q-btn>
            </q-card-section>
            <q-list bordered separator dense style="max-height: 150px; overflow: auto">
                <q-item
                    clickable
                    v-ripple
                    v-for="(att, attName) in filteredAttachments"
                    :key="attName"
                    @click="setSelected(attName)"
                    :active="selected.includes(attName)"
                >
                    <q-item-section avatar class="q-pr-none" style="min-width: 0; width: 28px">
                        <q-icon :name="getAttachmentIcon(att.content_type)" size="20px"></q-icon>
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
            <q-card-actions align="right">
                <div class="text-body q-pl-md text-grey">
                    {{ filteredAttachmentsLen }} attachment{{
                        filteredAttachmentsLen === 1 ? "" : "s"
                    }}
                </div>
                <q-space></q-space>
                <q-btn
                    color="primary"
                    flat
                    :disable="!selected.length"
                    label="Select"
                    @click="onOKClick"
                />
                <q-btn color="primary" flat label="Cancel" @click="onCancelClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as mime from "mime-types";
import { useDialogPluginComponent, useQuasar } from "quasar";
import { computed, defineComponent, ref } from "vue";

import CreateAttachmentDialog from "@/components/attachments/CreateAttachmentDialog.vue";
import { useStore } from "@/store";
import { API_ADD_ENTRY_ATTACHMENT, CreateAttachment } from "@/store/types";
import { getAttachmentIcon } from "@/utils";

export default defineComponent({
    props: {
        entryId: {
            type: String,
            required: true,
        },
        multiple: {
            type: Boolean,
            default: false,
        },
    },

    emits: [...useDialogPluginComponent.emits],

    setup(props) {
        // Providers
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $q = useQuasar();
        const $store = useStore();

        // Refs
        const selected = ref<string[]>([]);

        // Computed
        const filteredAttachments = computed(() =>
            $store.state.entries[props.entryId]
                ? $store.state.entries[props.entryId].attachments
                : []
        );
        const filteredAttachmentsLen = computed(
            () => Object.keys(filteredAttachments.value).length
        );

        // Functions
        const setSelected = (key: string) => {
            if (selected.value.includes(key)) {
                selected.value = selected.value.filter((s) => s !== key);
            } else {
                if (props.multiple) {
                    selected.value = [...selected.value, key];
                } else {
                    selected.value = [key];
                }
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
                    setSelected(attachment.name);
                    $q.notify({ message: "Attachment saved", type: "positive" });
                } catch (e) {
                    $q.notify({ message: e.message, type: "negative" });
                }
            });
        };

        return {
            dialogRef,
            onDialogHide,

            getAttachmentIcon,
            getExtension: mime.extension,
            selected,
            filteredAttachments,
            filteredAttachmentsLen,
            setSelected,
            createAttachment,

            onOKClick() {
                if (selected.value) {
                    onDialogOK(props.multiple ? selected.value : selected.value[0]);
                }
            },

            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
        };
    },
});
</script>

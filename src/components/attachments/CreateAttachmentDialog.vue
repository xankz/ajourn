<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section class="row align-items-center q-pb-sm">
                <div class="text-h6" v-if="replace">Replace attachment "{{ replace }}"</div>
                <div class="text-h6" v-else>Create attachment</div>
            </q-card-section>
            <q-tabs v-model="currentTab" dense class="text-primary">
                <q-tab name="upload" label="Upload"></q-tab>
                <q-tab name="raw" label="Raw"></q-tab>
            </q-tabs>
            <q-separator></q-separator>
            <q-tab-panels v-model="currentTab" animated>
                <q-tab-panel name="upload">
                    <q-file
                        outlined
                        label="Upload a file..."
                        v-model="uploadData"
                        :hint="'Size: ' + uploadDataSize"
                        debounce="600"
                    >
                        <template v-slot:prepend>
                            <q-icon name="attach_file" />
                        </template>
                    </q-file>
                </q-tab-panel>
                <q-tab-panel name="raw">
                    <q-input
                        type="textarea"
                        outlined
                        v-model="rawData"
                        :hint="'Size: ' + rawDataSize"
                        debounce="600"
                    ></q-input>
                </q-tab-panel>
            </q-tab-panels>
            <q-separator></q-separator>
            <q-input
                label="Name"
                class="q-pt-md q-px-md q-pb-md"
                v-model="attachmentName"
                outlined
                dense
                :rules="[
                    (v) => /^\w+$/.test(v) || 'Please use only letters, numbers, and underscores',
                ]"
            ></q-input>

            <q-card-actions align="right">
                <q-btn
                    flat
                    color="primary"
                    :label="replace ? 'Replace' : 'Create'"
                    :disable="!attachmentName || !/^\w+$/.test(attachmentName)"
                    @click="onOKClick"
                />
                <q-btn color="primary" flat label="Cancel" @click="onCancelClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { format, useDialogPluginComponent, useQuasar } from "quasar";
import { computed, defineComponent, PropType, ref } from "vue";

import { CreateAttachment, Entry } from "@/store/types";

export default defineComponent({
    name: "CreateAttachmentsDialog",
    props: {
        attachments: {
            type: Object as PropType<{ [key: string]: PouchDB.Core.FullAttachment }>,
            required: true,
        },
        replace: {
            type: String,
        },
        replaceData: {
            type: String,
        },
    },

    emits: [...useDialogPluginComponent.emits],

    setup(props) {
        // Providers
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $q = useQuasar();

        // Refs
        const currentTab = ref(props.replaceData ? "raw" : "upload");
        const uploadData = ref<File | undefined>(undefined);
        const rawData = ref(props.replaceData ? props.replaceData : "");
        const attachmentName = ref(props.replace ? props.replace : "");

        // Computed
        const rawDataSize = computed(() => format.humanStorageSize(new Blob([rawData.value]).size));
        const uploadDataSize = computed(() =>
            format.humanStorageSize(uploadData.value ? uploadData.value.size : 0)
        );

        // Functions
        const submit = () => {
            try {
                switch (currentTab.value) {
                    case "upload":
                        if (!uploadData.value) {
                            throw new Error("File never uploaded");
                        }
                        onDialogOK({
                            data: uploadData.value,
                            name: attachmentName.value,
                        } as CreateAttachment);
                        break;
                    case "raw":
                        onDialogOK({
                            data: rawData.value,
                            name: attachmentName.value,
                        } as CreateAttachment);
                        break;
                }
            } catch (e) {
                $q.notify({ type: "negative", message: e.message });
            }
        };
        const presubmit = () => {
            try {
                let cancel = false;
                if (!attachmentName.value) {
                    throw new Error("Attachment name empty");
                }
                if (!/^\w+$/.test(attachmentName.value)) {
                    throw new Error("Invalid attachment name");
                }
                // Check if attachment already exists
                if (
                    attachmentName.value in props.attachments &&
                    !(props.replace === attachmentName.value)
                ) {
                    $q.dialog({
                        title: "Attachment already exists",
                        message: `Attachment "${attachmentName.value}" already exists in this entry. Would you like to replace it?`,
                        cancel: true,
                        ok: "replace",
                        persistent: true,
                    })
                        .onOk(() => {
                            submit();
                        })
                        .onCancel(() => {
                            cancel = true;
                        });
                } else {
                    submit();
                }
            } catch (e) {
                $q.notify({ type: "negative", message: e.message });
            }
        };

        return {
            dialogRef,
            onDialogHide,

            currentTab,
            rawData,
            uploadData,
            rawDataSize,
            uploadDataSize,
            attachmentName,

            onOKClick() {
                presubmit();
                // onDialogOK();
            },

            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
        };
    },
});
</script>

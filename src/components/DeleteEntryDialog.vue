<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <div class="text-h6">Delete entry "{{ entry.title }}"</div>
            </q-card-section>
            <q-card-section>
                Are you sure you want to delete
                <span class="text-weight-bold">"{{ entry.title }}"?</span> This action cannot be
                undone!
                <br />
                <div class="text-red q-mt-sm">
                    All fields and relationships will be permanently deleted.
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn color="primary" label="Cancel" @click="onCancelClick" flat />
                <q-btn color="red" label="Delete" @click="onOKClick" flat />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from "quasar";
import { defineComponent, PropType } from "vue";

import { Entry } from "@/store/types";

export default defineComponent({
    name: "DeleteEntryDialog",
    props: {
        entry: {
            type: Object as PropType<Entry>,
            required: true,
        },
    },

    emits: [...useDialogPluginComponent.emits],

    setup() {
        // REQUIRED; must be called inside of setup()
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

        return {
            dialogRef,
            onDialogHide,

            onOKClick() {
                onDialogOK();
            },

            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
        };
    },
});
</script>

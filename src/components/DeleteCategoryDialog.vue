<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <div class="text-h6">Delete category "{{ category }}"</div>
            </q-card-section>
            <q-card-section>
                Are you sure you want to delete
                <span class="text-weight-bold">"{{ category }}"?</span> This action cannot be
                undone!
                <br />
                <div class="text-red q-mt-sm">
                    All matching entries will lose this category.
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
import { defineComponent } from "vue";

export default defineComponent({
    name: "DeleteCategoryDialog",
    props: {
        category: {
            type: String,
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

<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <!-- TODO: refactor so title only hides when content type is image -->
        <q-img
            v-if="attachment.content_type.startsWith('image')"
            :src="entryAttachment(entryId, attachment.name)"
        >
            <div class="absolute-bottom-right text-subtitle2 text-weight-bold">
                {{ attachment.name }}
            </div>
        </q-img>
        <q-card v-else-if="attachment.content_type.startsWith('text')">
            <q-card-section class="text-h6 q-pb-none ellipsis">
                {{ attachment.name }}
            </q-card-section>
            <q-card-section>
                {{ renderText(attachment.data) }}
            </q-card-section>
        </q-card>
        <q-card class="q-dialog-plugin" v-else-if="attachment.content_type.startsWith('audio')">
            <q-card-section class="text-h6 ellipsis">
                {{ attachment.name }}
            </q-card-section>
            <audio controls :src="entryAttachment(entryId, attachment.name)"></audio>
        </q-card>
        <q-card class="q-dialog-plugin" v-else-if="attachment.content_type.startsWith('video')">
            <q-card-section class="text-h6 ellipsis">
                {{ attachment.name }}
            </q-card-section>
            <video
                controls
                class="q-dialog-plugin"
                :src="entryAttachment(entryId, attachment.name)"
                style="max-width: 600px"
            ></video>
        </q-card>
        <q-card class="q-dialog-plugin" v-else>
            <q-card-section class="text-h6 ellipsis">
                {{ attachment.name }}
                <div class="text-subtitle2">{{ attachment.content_type }}</div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from "quasar";
import { defineComponent, PropType } from "vue";

import { useStore } from "@/store";
import { renderText } from "@/utils";

export default defineComponent({
    name: "PreviewAttachmentDialog",
    props: {
        attachment: {
            type: Object as PropType<PouchDB.Core.FullAttachment & { name: string }>,
            required: true,
        },
        entryId: {
            type: String,
            required: true,
        },
    },

    emits: [...useDialogPluginComponent.emits],

    setup() {
        // Providers
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $store = useStore();

        return {
            dialogRef,
            onDialogHide,

            onOKClick() {
                onDialogOK();
            },

            onCancelClick: onDialogCancel,
            entryAttachment: $store.getters.entryAttachment,
            renderText,
        };
    },
});
</script>

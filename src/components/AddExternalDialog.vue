<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <div class="text-h6">Add external media</div>
            </q-card-section>
            <q-card-section>
                <q-input
                    label="Enter a URL to determine media"
                    v-model="mediaUrl"
                    debounce="1000"
                    :loading="mediaLoading"
                    :disable="mediaLoading"
                    outlined
                    autofocus
                ></q-input>
                <div class="q-pt-sm text-negative" v-if="errorText">{{ errorText }}</div>
            </q-card-section>
            <q-expansion-item label="Additional settings" dense>
                <q-card-section>
                    <q-input label="Custom label" outlined dense></q-input>
                </q-card-section>
            </q-expansion-item>
            <q-card-actions align="right">
                <q-btn flat color="primary" label="Add" disable @click="onOKClick" />
                <q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from "quasar";
import { defineComponent, ref, watchEffect } from "vue";

export default defineComponent({
    props: {},
    name: "AddExternalDialog",
    emits: [...useDialogPluginComponent.emits],
    setup() {
        // Providers
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

        // Refs
        const mediaUrl = ref("");
        const mediaLoading = ref(false);
        const mediaItem = ref({});
        const errorText = ref("");

        // Functions
        // validateYoutubeUrl from https://irishdotnet.dev/how-to-validate-a-youtube-url-using-javascript
        function validateYoutubeUrl(url = "") {
            const regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
            if (url.match(regExp)) {
                return true;
            } else {
                return false;
            }
        }

        const timeout = async (ms: number) => new Promise((r) => setTimeout(r, ms));

        // Effects
        // Parse media on media URL change
        watchEffect(async () => {
            if (mediaUrl.value.length < 3) {
                return;
            }

            // Match media to service
            mediaLoading.value = true;
            errorText.value = "";
            await timeout(600);

            try {
                const res = await fetch(mediaUrl.value);
                console.log(res);
            } catch (e) {
                errorText.value = e.message;
            } finally {
                mediaLoading.value = false;
            }
        });

        return {
            dialogRef,
            onDialogHide,
            mediaUrl,
            mediaLoading,
            errorText,

            onOKClick() {
                onDialogOK();
            },

            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
        };
    },
});
</script>

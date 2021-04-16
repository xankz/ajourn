<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin">
            <preview
                :image="cropResults?.image"
                :coordinates="cropResults?.coordinates"
                v-if="cropValue === 'square'"
                ref="previewRef"
                :width="64"
                :height="64"
                class="preview"
                style="position: absolute; top: 12px; left: 12px; z-index: 300; border-radius: 4px;"
            ></preview>
            <cropper
                class="cropper"
                :debounce="false"
                ref="cropperRef"
                :src="imgUrl"
                :stencil-props="cropStencilOpts"
                @change="onCropChange"
            ></cropper>
            <q-card-actions align="between">
                <div class="row items-center ellipsis">
                    <q-select
                        label="Crop"
                        :options="cropOptions"
                        option-label="label"
                        class="q-mr-md"
                        map-options
                        outlined
                        dense
                        option-value="value"
                        v-model="cropValue"
                        emit-value
                    >
                        <q-tooltip v-if="cropValue" anchor="top middle">{{ cropHelp }}</q-tooltip>
                    </q-select>
                </div>
                <div>
                    <q-btn color="primary" flat label="Save changes" @click="submit" />
                    <q-btn color="primary" flat label="Cancel" @click="onCancelClick" />
                </div>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from "quasar";
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { Cropper, Preview } from "vue-advanced-cropper";

export default defineComponent({
    name: "CropAttachmentDialog",
    props: {
        image: {
            type: Blob,
            required: true,
        },
        imageType: {
            type: String,
            required: true,
        },
    },
    components: { Cropper, Preview },

    emits: [...useDialogPluginComponent.emits],

    setup(props) {
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const cropOptions = ref([
            {
                label: "Free",
                value: "free",
                help: "Free is unconstrained, use any size.",
            },
            {
                label: "Square",
                value: "square",
                help: "Square is best for avatars.",
            },
        ]);

        // Refs
        const imgUrl = ref<string>("");
        const cropValue = ref<string | undefined>("free");
        const cropperRef = ref<typeof Cropper | undefined>(undefined);
        const previewRef = ref<typeof Preview | undefined>(undefined);
        const cropResults = ref<{ image: any; coordinates: any } | undefined>(undefined);

        // Computed
        const cropHelp = computed(
            () => cropOptions.value.find((c) => c.value === cropValue.value)?.help
        );
        const cropStencilOpts = computed(() => {
            const opts: Record<string, any> = {
                movable: true,
                scalable: true,
            };
            if (cropValue.value && cropValue.value == "square") {
                opts.aspectRatio = 1;
            }
            return opts;
        });

        // Functions
        const onCropChange = (changeEv: any) => {
            cropResults.value = changeEv;
        };
        const submit = () => {
            if (cropperRef.value) {
                const { canvas } = cropperRef.value.getResult();
                canvas.toBlob((b: Blob) => {
                    onDialogOK(b);
                }, props.imageType);
            }
        };

        // Effects
        onMounted(() => {
            // Create image object URL
            imgUrl.value = URL.createObjectURL(props.image);
        });
        onUnmounted(() => {
            // Destroy image object URL
            if (imgUrl.value) {
                URL.revokeObjectURL(imgUrl.value);
            }
        });

        return {
            dialogRef,
            onDialogHide,
            imgUrl,
            cropValue,
            cropHelp,
            cropOptions,
            cropStencilOpts,
            cropperRef,
            cropResults,
            previewRef,
            onCropChange,
            submit,

            onCancelClick: onDialogCancel,
        };
    },
});
</script>

<style scoped lang="scss">
.preview {
    box-shadow: 0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%),
        0 3px 1px -2px rgb(0 0 0 / 12%) !important;
}
</style>

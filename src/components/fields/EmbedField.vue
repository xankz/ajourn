<template>
    <div v-if="editView">
        <q-input
            label="URL"
            :modelValue="modelValue.url"
            @update:modelValue="updateUrl"
            debounce="600"
            :loading="embedLoading"
            outlined
            dense
        ></q-input>
        <div class="text-body text-grey-8 q-pt-md row items-center">
            <div class="text-red" v-if="embedService == EmbedFieldService.Invalid">
                <q-icon name="clear" class="q-pr-sm"></q-icon>
                Please enter a valid URL
            </div>
            <template v-else-if="embedService != EmbedFieldService.Unknown">
                <q-icon name="checkmark" class="q-pr-sm"></q-icon>
                Will use {{ EmbedFieldService[embedService] }} style.
            </template>
            <template v-else>
                <q-icon name="help_outline" class="q-pr-sm"></q-icon>
                Unknown, will use generic style.
            </template>
        </div>
    </div>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <q-video
            v-if="embedServiceC == EmbedFieldService.YouTube"
            :src="modelValue.url.replace('watch?v=', 'embed/')"
        ></q-video>
        <iframe
            v-else-if="embedServiceC == EmbedFieldService.Soundcloud"
            :src="
                'https://soundcloud.com/oembed?format=js&url=' +
                encodeURIComponent(modelValue.url) +
                '&iframe=true'
            "
        ></iframe>
        <q-card
            v-else-if="embedServiceC == EmbedFieldService.Unknown"
            class="q-mt-sm"
            flat
            bordered
        >
            <q-item>
                <q-item-section avatar class="q-pr-none" style="min-width: 48px">
                    <q-icon name="link"></q-icon>
                </q-item-section>
                <q-item-section class="text-subtitle2">
                    <a :href="modelValue.url">{{ modelValue.url }}</a>
                </q-item-section>
            </q-item>
        </q-card>
        <div v-else class="text-negative text-subtitle2">Error parsing URL!</div>
    </div>
</template>

<script lang="ts">
import { useQuasar } from "quasar";
import { computed, defineComponent, PropType, ref, watchEffect } from "vue";

import { EmbedField, EmbedFieldService, Entry, FieldType } from "@/store/types";
import { getEmbedService } from "@/utils";

import AddExternalDialog from "../AddExternalDialog.vue";

export default defineComponent({
    name: "EmbedField",
    emits: ["update:modelValue"],
    props: {
        modelValue: {
            type: Object as PropType<EmbedField>,
            required: true,
        },
        editView: {
            type: Boolean,
            default: false,
        },
        entry: {
            type: Object as PropType<Entry>,
            required: true,
        },
    },
    setup: (props, { emit }) => {
        // Providers
        const $q = useQuasar();

        // Refs
        const embedLoading = ref(false);
        const embedService = ref(EmbedFieldService.Unknown);

        // Computed
        const embedServiceC = computed(() => getEmbedService(props.modelValue.url));

        // Functions
        const timeout = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        const updateUrl = (url: string) => {
            emit("update:modelValue", { ...props.modelValue, url } as EmbedField);
        };

        // Effects
        watchEffect(async () => {
            if (!props.modelValue.url) {
                return;
            }
            embedLoading.value = true;
            await timeout(200);
            embedService.value = getEmbedService(props.modelValue.url);
            embedLoading.value = false;
        });

        return {
            FieldType,
            updateUrl,
            embedLoading,
            embedService,
            embedServiceC,
            EmbedFieldService,
        };
    },
});
</script>

<style lang="scss" scoped>
.no-i::v-deep i {
    display: none !important;
}
</style>

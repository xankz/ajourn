<template>
    <template v-if="editView">
        <div class="row items-center">
            <div class="text-body text-grey">{{ linkedAttachments.length }} selected</div>
            <q-space></q-space>
            <q-btn
                @click="selectAttachments"
                label="Select"
                icon="upload_file"
                class="select-att"
                flat
                color="primary"
            ></q-btn>
        </div>
        <q-list bordered separator class="q-mt-sm" dense>
            <q-item v-for="att in linkedAttachments" :key="att.name">
                <q-item-section avatar class="q-pr-none" style="min-width: 36px">
                    <q-icon :name="getAttachmentIcon(att.content_type)" color="grey-8"></q-icon>
                </q-item-section>
                <q-item-section class="text-weight-bold" style="line-height: 1.3em">
                    {{ att.name }}
                </q-item-section>
                <q-item-section side>
                    <q-btn flat dense round icon="close" @click="removeAttachment(att.name)">
                    </q-btn>
                </q-item-section>
            </q-item>
        </q-list>
    </template>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <div
            class="shadow-1 rounded-borders row q-gutter-sm q-mb-md"
            style="margin-left: 0; margin-top: 0; padding-bottom: 8px"
        >
            <attachments-field-icon
                v-for="att in linkedAttachments"
                :key="att.name"
                :attachment="att"
                :entryId="entry.id"
                @click="previewAttachment(att)"
            ></attachments-field-icon>
        </div>
    </div>
</template>

<script lang="ts">
import { useQuasar } from "quasar";
import { computed, defineComponent, onMounted, PropType, ref } from "vue";

import SelectAttachmentsDialog from "@/components/attachments/SelectAttachmentsDialog.vue";
import { useStore } from "@/store";
import {
    AttachmentsField,
    DescriptionField,
    Entry,
    Field,
    FieldType,
    TextField,
} from "@/store/types";
import { b64, getAttachmentIcon, renderText } from "@/utils";

import PreviewAttachmentDialog from "../attachments/PreviewAttachmentDialog.vue";
import AttachmentsFieldIcon from "./AttachmentsFieldIcon.vue";

export default defineComponent({
    components: { AttachmentsFieldIcon },
    name: "AttachmentsField",
    emits: ["update:modelValue"],
    props: {
        modelValue: {
            type: Object as PropType<AttachmentsField>,
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
        const $store = useStore();

        // Refs
        const currentSlide = ref("");

        // Computed
        const linkedAttachments = computed(() =>
            Object.entries(props.entry.attachments)
                .filter((kv) => props.modelValue.attachments.includes(kv[0]))
                .map((kv) => {
                    return {
                        name: kv[0],
                        ...kv[1],
                    };
                })
        );

        // Functions
        const updateAttachments = (attachments: string[]) => {
            emit("update:modelValue", { ...props.modelValue, attachments } as AttachmentsField);
        };

        const removeAttachment = (key: string) => {
            if (!props.modelValue.attachments.includes(key)) {
                return;
            }
            emit("update:modelValue", {
                ...props.modelValue,
                attachments: props.modelValue.attachments.filter((k2) => k2 !== key),
            } as AttachmentsField);
        };

        const selectAttachments = () => {
            $q.dialog({
                component: SelectAttachmentsDialog,
                componentProps: {
                    entry: props.entry,
                },
            }).onOk((name: string) => {
                if (props.modelValue.attachments.includes(name)) return;
                updateAttachments([...props.modelValue.attachments, name]);
            });
        };
        const previewAttachment = (att: PouchDB.Core.FullAttachment & { name: string }) => {
            $q.dialog({
                component: PreviewAttachmentDialog,
                componentProps: {
                    attachment: att,
                    entryId: props.entry.id,
                },
            });
        };

        return {
            selectAttachments,
            linkedAttachments,
            getAttachmentIcon,
            removeAttachment,
            currentSlide,
            entryAttachment: $store.getters.entryAttachment,
            renderText,
            previewAttachment,
        };
    },
});
</script>

<style lang="scss" scoped>
.select-att ::v-deep .q-icon {
    margin-right: 6px;
}
</style>

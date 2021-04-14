<template>
    <div v-if="editView">
        <q-btn
            label="Edit locations"
            outline
            color="primary"
            class="full-width"
            :disable="!modelValue.imageKey"
            @click="editLocations"
        ></q-btn>
        <q-select
            label="Image attachment"
            outlined
            dense
            class="q-mt-sm"
            :options="attachmentOptions"
            :modelValue="modelValue.imageKey"
            @update:modelValue="updateImageKey"
        >
            <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" dense>
                    <q-item-section>
                        <q-item-label v-html="scope.opt.label"></q-item-label>
                    </q-item-section>
                    <q-item-section avatar>
                        <q-icon size="16px" :name="scope.opt.icon"></q-icon>
                    </q-item-section>
                </q-item>
            </template>
            <template v-slot:no-option>
                <q-item>
                    <q-item-section class="text-italic text-grey">
                        No attachments saved
                    </q-item-section>
                </q-item>
            </template>
        </q-select>
        <q-input
            class="q-mt-sm"
            outlined
            dense
            label="Custom name"
            :modelValue="modelValue.customName"
            @update:modelValue="updateCustomName"
        ></q-input>
    </div>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <map-view
            :locations="modelValue.locations"
            :background="mapBackground"
            showLocations
            style="height: 200px"
            v-if="mapBackground"
        ></map-view>
        <div class="text-subtitle2 q-mb-xs text-negative" v-else>
            Set a background to load this map.
        </div>
    </div>
</template>

<script lang="ts">
import { useQuasar } from "quasar";
import { computed, defineComponent, PropType } from "vue";

import { useStore } from "@/store";
import { Entry, FieldType, MapField, MapFieldLocation } from "@/store/types";
import { getAttachmentIcon } from "@/utils";

import EditMapDialog from "../maps/EditMapDialog.vue";
import MapView from "../maps/MapView.vue";

export default defineComponent({
    name: "MapField",
    emits: ["update:modelValue"],
    components: { MapView },
    props: {
        modelValue: {
            type: Object as PropType<MapField>,
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
        const $store = useStore();
        const $q = useQuasar();

        // Refs
        // const mapBackground = ref<string>(
        //     $store.getters.entryAttachmentFull(props.entry.id, props.modelValue.imageKey)
        // );

        // Computed
        const attachmentOptions = computed(() =>
            $store.state.entries[props.entry.id]
                ? Object.entries($store.state.entries[props.entry.id].attachments)
                      .filter((kv) => kv[1].content_type.startsWith("image"))
                      .map((kv) => {
                          return {
                              label: kv[0],
                              value: kv[0],
                              icon: getAttachmentIcon(kv[1].content_type),
                          };
                      })
                : []
        );
        const mapBackground = computed(() => {
            const att = $store.getters.entryAttachmentFull(
                props.entry.id,
                props.modelValue.imageKey
            );
            if (!att) {
                return undefined;
            }
            return {
                data: att.data,
                contentType: att.content_type,
            };
        });

        // Functions
        const updateCustomName = (customName: string) => {
            emit("update:modelValue", {
                ...props.modelValue,
                customName,
            } as MapField);
        };
        const updateImageKey = (imageKey: { label: string; value: string; icon: string }) => {
            emit("update:modelValue", {
                ...props.modelValue,
                imageKey: imageKey.value,
            } as MapField);
        };
        const editLocations = () => {
            $q.dialog({
                component: EditMapDialog,
                componentProps: {
                    modelValue: props.modelValue,
                    entryId: props.entry.id,
                },
            }).onOk((data: { locations: MapFieldLocation[] }) => {
                emit("update:modelValue", {
                    ...props.modelValue,
                    locations: data.locations,
                } as MapField);
            });
        };

        return {
            FieldType,
            updateCustomName,
            updateImageKey,
            attachmentOptions,
            editLocations,
            mapBackground,
        };
    },
});
</script>

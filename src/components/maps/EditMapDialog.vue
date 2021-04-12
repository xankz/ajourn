<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin" style="width: 100%">
            <q-card-section class="row align-items-center">
                <div class="text-h6">Editing "{{ modelValue.name }}"</div>
                <q-space></q-space>
                <q-btn
                    icon="add_location_alt"
                    color="primary"
                    flat
                    round
                    dense
                    @click="addLocation"
                >
                    <q-tooltip>Create a new location</q-tooltip>
                </q-btn>
            </q-card-section>
            <div>
                <map-view
                    :background="mapBackground"
                    :locations="mapLocations"
                    showLocations
                    editLocations
                    @update:locations="mapLocations = $event"
                    @selected="mapSelected = $event"
                    style="height: 300px"
                    ref="mapRef"
                ></map-view>
            </div>
            <q-card-section class="q-pb-sm">
                <div class="row">
                    <div class="col col-md-4">
                        <q-select
                            :label="selectOpts.length ? 'Select a location' : '(no locations)'"
                            :disable="!selectOpts.length"
                            dense
                            :options="selectOpts"
                            outlined
                            class="q-mr-sm"
                            v-model="mapSelected"
                        ></q-select>
                    </div>
                    <div class="col">
                        <select-entry
                            outlined
                            dense
                            class="q-mr-sm"
                            options-dense
                            v-if="mapSelectedPtr"
                            v-model="mapSelectedPtr.entryId"
                        ></select-entry>
                    </div>
                    <div class="col-auto">
                        <q-btn
                            icon="delete_outline"
                            class="full-height"
                            outline
                            color="negative"
                            :disable="!mapSelectedPtr"
                        >
                        </q-btn>
                    </div>
                </div>
            </q-card-section>
            <q-card-section>
                <div class="row">
                    <div class="col col-md-2 q-pr-sm">
                        <q-input
                            type="number"
                            label="X"
                            dense
                            outlined
                            :modelValue="mapSelectedPtr.position[0]"
                            @update:modelValue="
                                mapRef.moveLocation(mapSelected, {
                                    lat: mapSelectedPtr.position[1],
                                    lng: $event,
                                })
                            "
                            v-if="mapSelectedPtr"
                        ></q-input>
                    </div>
                    <div class="col col-md-2 q-pr-sm">
                        <q-input
                            type="number"
                            label="Y"
                            dense
                            outlined
                            :modelValue="mapSelectedPtr.position[1]"
                            @update:modelValue="
                                mapRef.moveLocation(mapSelected, {
                                    lat: $event,
                                    lng: mapSelectedPtr.position[0],
                                })
                            "
                            v-if="mapSelectedPtr"
                        ></q-input>
                    </div>
                    <q-space></q-space>
                    <q-btn label="Save changes" color="primary" flat @click="saveChanges"></q-btn>
                </div>
            </q-card-section>
            <!-- <q-card-actions align="right">
                <q-btn color="primary" label="OK" @click="onOKClick" />
                <q-btn color="primary" label="Cancel" @click="onCancelClick" />
            </q-card-actions> -->
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { LImageOverlay, LMap, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import * as L from "leaflet";
import { useDialogPluginComponent, useQuasar } from "quasar";
import {
    computed,
    defineComponent,
    onBeforeUpdate,
    onMounted,
    onUnmounted,
    PropType,
    ref,
    watch,
    watchEffect,
} from "vue";

import { useStore } from "@/store";
import { MapField, MapFieldLocation } from "@/store/types";
import { b64toBlob } from "@/utils";

import SelectEntry from "../form/SelectEntry.vue";
import MapView from "./MapView.vue";

export default defineComponent({
    name: "EditMapDialog",
    props: {
        entryId: {
            type: String,
            required: true,
        },
        modelValue: {
            type: Object as PropType<MapField>,
            required: true,
        },
    },
    // components: { LMap, LImageOverlay, LMarker, LPopup, SelectEntry },
    components: { SelectEntry, MapView },

    emits: [...useDialogPluginComponent.emits],

    setup(props) {
        // Providers
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $store = useStore();
        const $q = useQuasar();

        // Refs
        const mapBackground = computed(() => {
            const att = $store.getters.entryAttachmentFull(
                props.entryId,
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
        const mapLocations = ref<MapFieldLocation[]>(props.modelValue.locations);
        const mapSelected = ref<number | undefined>(undefined);
        const mapRef = ref<typeof MapView | undefined>(undefined);

        // Computed
        // const selectOpts = computed(() =>
        //     mapLocations.value.map((l, idx) => ({ label: idx, data: l }))
        // );
        const selectOpts = computed(() => mapLocations.value.map((_, i) => i));
        const mapSelectedPtr = computed(() =>
            mapSelected.value !== undefined ? mapLocations.value[mapSelected.value] : undefined
        );

        // Functions
        const addLocation = () => {
            mapLocations.value = [
                ...mapLocations.value,
                {
                    entryId: "",
                    position: mapRef.value ? mapRef.value.getMapCenter() : [0, 0],
                },
            ];
            mapSelected.value = mapLocations.value.length - 1;
        };
        const saveChanges = () => {
            onDialogOK({
                locations: mapLocations,
            });
        };

        return {
            mapBackground,
            saveChanges,
            dialogRef,
            onDialogHide,
            mapLocations,
            selectOpts,
            CRS: L.CRS,
            addLocation,
            mapSelected,
            mapSelectedPtr,
            mapRef,

            onCancelClick: onDialogCancel,
        };
    },
});
</script>

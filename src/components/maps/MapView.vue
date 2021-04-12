<template>
    <l-map
        :crs="CRS.Simple"
        :center="mapCenter"
        v-model:zoom="mapZoom"
        :minZoom="-2"
        ref="mapRef"
        :options="{
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: 'topleft',
            },
        }"
        v-if="mapReady"
    >
        <l-image-overlay :url="mapImage" :bounds="mapBounds"></l-image-overlay>
        <template v-if="showLocations">
            <l-marker
                v-for="(location, idx) in mapLocations"
                :key="idx"
                :lat-lng="location.coordinates"
                :draggable="editLocations"
                :ref="
                    (el) => {
                        if (el) mapLocationRefs[idx] = el;
                    }
                "
                @update:latLng="updateLocation(idx, $event)"
                @click="$emit('selected', idx)"
            >
                <l-popup :options="{ minWidth: 200, closeButton: false }">
                    <entry-link :entryId="location.entryId" :showLink="!editLocations"></entry-link>
                </l-popup>
            </l-marker>
        </template>
        <l-control class="leaflet-control leaflet-demo-control" v-if="locations.length">
            <q-btn icon="chevron_left" dense flat size="10px" @click="focusPrevLocation"></q-btn>
            <q-btn icon="chevron_right" dense flat size="10px" @click="focusNextLocation"></q-btn>
        </l-control>
    </l-map>
</template>

<script lang="ts">
import "leaflet.fullscreen";

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { LControl, LImageOverlay, LMap, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import * as JD from "@vue-leaflet/vue-leaflet";
import * as L from "leaflet";
import { isEqual } from "lodash";
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onBeforeUpdate,
    onMounted,
    onUnmounted,
    PropType,
    ref,
    watch,
    watchEffect,
} from "vue";

import { MapFieldLocation } from "@/store/types";
import { b64toBlob } from "@/utils";

import EntryLink from "../EntryLink.vue";

type MapViewLocation = {
    entryId: string;
    coordinates: { lat: number; lng: number };
    ref?: L.Marker;
};

export default defineComponent({
    name: "MapView",
    props: {
        background: {
            type: Object as PropType<{ data: string; contentType: string }>,
            required: true,
        },
        locations: {
            type: Array as PropType<Array<MapFieldLocation>>,
            default: [],
        },
        showLocations: {
            type: Boolean,
            default: false,
        },
        editLocations: {
            type: Boolean,
            default: false,
        },
    },
    components: { LMap, LImageOverlay, LMarker, LPopup, EntryLink, LControl },
    emits: ["selected", "update:locations"],
    setup: (props, ctx) => {
        // Refs
        const mapImage = ref("");
        const mapBounds = ref<[[number, number], [number, number]]>([
            [0, 0],
            [0, 0],
        ]);
        const mapCenter = ref<[number, number]>([0, 0]);
        const mapZoom = ref(0);
        const mapLocationRefs = ref<Array<{ leafletObject: L.Marker }>>([]);
        const mapRef = ref<typeof LMap | undefined>(undefined);
        const mapReady = ref(false);
        const mapFocus = ref(0);

        // Computed
        const mapLocations = computed<MapViewLocation[]>(() =>
            props.locations.map((l, i) => {
                return {
                    entryId: l.entryId,
                    coordinates: { lng: l.position[0], lat: l.position[1] },
                    ref: mapLocationRefs.value[i]
                        ? (mapLocationRefs.value[i].leafletObject as L.Marker)
                        : undefined,
                };
            })
        );

        // Functions
        const normalizeLocation = (loc: MapViewLocation): MapFieldLocation => {
            return { entryId: loc.entryId, position: [loc.coordinates.lat, loc.coordinates.lng] };
        };
        const updateLocation = (idx: number, coordinates: { lat: number; lng: number }) => {
            ctx.emit(
                "update:locations",
                mapLocations.value.map(
                    (ml, idx2): MapFieldLocation => {
                        return {
                            entryId: ml.entryId,
                            position:
                                idx === idx2
                                    ? [coordinates.lng, coordinates.lat]
                                    : [ml.coordinates.lng, ml.coordinates.lat],
                        };
                    }
                )
            );
        };
        const focusLocation = (idx: number) => {
            if (!mapRef.value || !mapLocationRefs.value[idx]) {
                return;
            }
            mapRef.value.leafletObject.flyTo({
                lat: props.locations[idx].position[1],
                lng: props.locations[idx].position[0],
            });
        };
        const focusPrevLocation = () => {
            mapFocus.value = mapFocus.value <= 0 ? props.locations.length - 1 : mapFocus.value - 1;
            focusLocation(mapFocus.value);
        };
        const focusNextLocation = () => {
            mapFocus.value = mapFocus.value >= props.locations.length - 1 ? 0 : mapFocus.value + 1;
            focusLocation(mapFocus.value);
        };
        const moveLocation = (idx: number, coordinates: { lat: number; lng: number }) => {
            if (mapLocationRefs.value[idx]) {
                mapLocationRefs.value[idx].leafletObject.setLatLng(coordinates);
            }
        };
        const updateBackground = () => {
            mapReady.value = false;

            // Convert background b64 to blob
            const mapBlob = b64toBlob(props.background.data, props.background.contentType);
            mapImage.value = URL.createObjectURL(mapBlob);

            // Calculate background bounds
            const img = new Image();
            img.onload = () => {
                mapBounds.value = [
                    [0, 0],
                    [img.height, img.width],
                ];
                mapCenter.value = [img.width / 2, img.height / 2];
                mapReady.value = true;
            };
            img.src = mapImage.value;
        };

        const getMapCenter = () => {
            return mapCenter;
        };

        // Effects
        onMounted(() => {
            updateBackground();
            setTimeout(() => {
                if (!mapRef.value) {
                    return;
                }
                L.control.fullscreen().addTo((mapRef.value.leafletObject as unknown) as L.Map);
            }, 500);
        });
        watchEffect(() => {
            if (props.background) {
                updateBackground();
            }
        });
        onBeforeUpdate(() => {
            mapLocationRefs.value = [];
        });
        // onMounted(() => {});
        onBeforeUnmount(() => {
            // Release map object URL
            if (mapImage.value) {
                URL.revokeObjectURL(mapImage.value);
            }
        });

        return {
            mapImage,
            mapBounds,
            mapCenter,
            mapLocations,
            mapZoom,
            normalizeLocation,
            CRS: L.CRS,
            updateLocation,
            focusPrevLocation,
            focusNextLocation,
            focusLocation,
            mapFocus,
            mapLocationRefs,
            mapRef,
            getMapCenter,
            moveLocation,
            mapReady,
        };
    },
});
</script>

<style>
.leaflet-demo-control {
    background: white;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 0.6em;
    padding: 0.5em;
    float: right;
    margin: 10px;
}
</style>

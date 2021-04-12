<template>
    <q-tabs class="text-primary" v-model="tab" dense>
        <q-tab label="Icon" name="icon"></q-tab>
        <q-tab label="Image" name="image" v-if="!useAttachments"></q-tab>
        <q-tab label="Attachment" name="attachment" v-if="useAttachments"></q-tab>
    </q-tabs>
    <q-separator></q-separator>
    <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="icon" class="text-dark">
            <q-list :style="{ maxHeight: '150px' }">
                <q-item class="column q-pa-none" v-for="g in iconGroups" :key="g">
                    <q-item-label caption>{{ g.category }}</q-item-label>
                    <q-item-label class="full-width row q-my-xs">
                        <q-icon
                            v-for="i in g.icons"
                            :name="i"
                            :key="i"
                            class="q-pa-xs cursor-pointer"
                            size="16px"
                            @click="attachIcon(i)"
                        ></q-icon>
                    </q-item-label>
                </q-item>
            </q-list>
        </q-tab-panel>
        <q-tab-panel name="image" v-if="!useAttachments">
            <q-file
                bottom-slots
                accept="image/*"
                class="full-width"
                placeholder="Choose one image..."
                v-model="selectedImage"
            >
                <template v-slot:hint>Images only. 512x512 recommended.</template>
            </q-file>
            <q-btn
                color="primary"
                label="Attach"
                class="full-width q-mt-lg"
                size="sm"
                @click="attachImage"
            ></q-btn>
        </q-tab-panel>
        <q-tab-panel name="attachment" class="text-dark" v-if="useAttachments">
            <q-btn
                outline
                dense
                label="Select an attachment"
                color="primary"
                @click="selectAttachment"
            ></q-btn>
        </q-tab-panel>
    </q-tab-panels>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Entry } from "@/store/types";

import SelectAttachmentsDialog from "./attachments/SelectAttachmentsDialog.vue";

interface EntryIconDialogData {
    selectedImage?: File;
    tab: "icon" | "image";
    iconGroups: {
        category: string;
        icons: string[];
    }[];
}

export default defineComponent({
    name: "EntryIconDialog",
    props: {
        useAttachments: {
            type: Boolean,
            default: false,
        },
        entry: {
            type: Object as PropType<Entry>,
        },
    },
    emits: ["attach"],
    methods: {
        attachImage() {
            if (this.selectedImage) {
                this.$emit("attach", { type: "image", data: this.selectedImage });
            }
        },
        attachIcon(icon: string) {
            this.$emit("attach", { type: "icon", data: icon });
        },
        selectAttachment() {
            this.$q
                .dialog({
                    component: SelectAttachmentsDialog,
                    componentProps: {
                        entry: this.entry,
                    },
                })
                .onOk((val: string) => {
                    this.$emit("attach", { type: "attachment", data: val });
                });
        },
    },
    data() {
        return {
            selectedImage: undefined,
            tab: "icon",
            iconGroups: [
                {
                    category: "Standard",
                    icons: ["subject", "person", "map"],
                },
                {
                    category: "Figures",
                    icons: [
                        "person",
                        "group",
                        "groups",
                        "directions_run",
                        "elderly",
                        "emoji_people",
                        "self_improvement",
                        "record_voice_over",
                        "manage_accounts",
                        "accessible",
                        "sentiment_very_satisfied",
                        "sentiment_satisfied",
                        "sentiment_neutral",
                        "sentiment_dissatisfied",
                        "sentiment_very_dissatisfied",
                        "mood_bad",
                    ],
                },
                {
                    category: "Locations",
                    icons: [
                        "home",
                        "apartment",
                        "corporate_fare",
                        "fence",
                        "holiday_village",
                        "foundation",
                        "festival",
                        "store_mall_directory",
                        "storefront",
                        "terrain",
                        "map",
                        "park",
                        "place",
                        "attractions",
                        "home_work",
                        "public",
                    ],
                },
                {
                    category: "Miscellaneous",
                    icons: [
                        "radio_button_checked",
                        "radio_button_unchecked",
                        "trip_origin",
                        "lens",
                        "adjust",
                        "device_hub",
                        "bubble_chart",
                        "error",
                        "stars",
                        "build_circle",
                    ],
                },
            ],
        } as EntryIconDialogData;
    },
});
</script>

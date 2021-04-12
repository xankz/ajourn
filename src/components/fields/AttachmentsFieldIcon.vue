<template>
    <q-img
        v-if="attachment.content_type.startsWith('image')"
        class="bg-grey-3 rounded-borders cursor-pointer"
        style="width: 64px; height: 64px"
        :src="entryAttachment(entryId, attachment.name)"
    >
        <q-tooltip
            :target="true"
            anchor="center middle"
            self="bottom middle"
            class="text-weight-bold bg-black"
            transition-show="scale"
            transition-hide="scale"
        >
            {{ attachment.name }}
        </q-tooltip>
    </q-img>
    <div
        v-else-if="attachment.content_type.startsWith('text')"
        class="bg-grey-3 rounded-borders text-caption q-pa-xs ellipsis-3-lines cursor-pointer"
        style="
            width: 64px;
            height: 64px;
            line-height: 1.3em;
            font-size: 10px;
            word-wrap: break-word;
        "
    >
        <q-tooltip
            :target="true"
            anchor="center middle"
            self="bottom middle"
            class="text-weight-bold bg-black"
            transition-show="scale"
            transition-hide="scale"
        >
            {{ attachment.name }}
        </q-tooltip>
        {{ renderText(attachment.data) }}
    </div>
    <q-avatar
        v-else-if="attachment.content_type.startsWith('audio')"
        rounded
        color="blue-grey-3"
        class="cursor-pointer"
        icon="headset"
        text-color="dark"
        style="width: 64px; height: 64px"
    >
        <q-tooltip
            :target="true"
            anchor="center middle"
            self="bottom middle"
            class="text-weight-bold bg-black"
            transition-show="scale"
            transition-hide="scale"
        >
            {{ attachment.name }}
        </q-tooltip>
    </q-avatar>
    <q-avatar
        v-else-if="attachment.content_type.startsWith('video')"
        rounded
        color="red-3"
        class="cursor-pointer"
        icon="play_circle_outline"
        text-color="dark"
        style="width: 64px; height: 64px"
    >
        <q-tooltip
            :target="true"
            anchor="center middle"
            self="bottom middle"
            class="text-weight-bold bg-black"
            transition-show="scale"
            transition-hide="scale"
        >
            {{ attachment.name }}
        </q-tooltip>
    </q-avatar>
    <q-avatar
        v-else
        rounded
        color="grey-3"
        class="cursor-pointer"
        icon="insert_drive_file"
        text-color="dark"
        style="width: 64px; height: 64px"
    >
        <q-tooltip
            :target="true"
            anchor="center middle"
            self="bottom middle"
            class="text-weight-bold bg-black"
            transition-show="scale"
            transition-hide="scale"
        >
            {{ attachment.name }}
        </q-tooltip>
    </q-avatar>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { useStore } from "@/store";
import { renderText } from "@/utils";

export default defineComponent({
    name: "AttachmentsFieldIcon",
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
    setup: (props) => {
        // Providers
        const $store = useStore();

        return {
            entryAttachment: $store.getters.entryAttachment,
            renderText,
        };
    },
});
</script>

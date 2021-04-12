<template>
    <div class="q-ma-lg">
        <router-view name="view"></router-view>
    </div>
</template>

<script>
import PouchDB from "pouchdb";
import { Loading, useQuasar } from "quasar";
import { QSpinnerGrid } from "quasar";
import { computed, defineComponent, onMounted, onUnmounted } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";

import { useStore } from "@/store";
import { API_CLOSE_JOURNAL, UI_VISIBILITY } from "@/store/types";

export default defineComponent({
    name: "Dashboard",
    setup() {
        const $store = useStore();
        const $q = useQuasar();

        // Display UI on mount
        onMounted(() => {
            $store.commit(UI_VISIBILITY, true);
        });

        // Hide UI on leave
        onUnmounted(() => {
            $store.commit(UI_VISIBILITY, false);
        });

        onBeforeRouteLeave(async () => {
            await $store.dispatch(API_CLOSE_JOURNAL);
        });

        return {
            currentJournal: computed(() => $store.getters.currentJournal),
        };
    },
});
</script>

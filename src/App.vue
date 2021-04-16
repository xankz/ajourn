<template>
    <router-view></router-view>
</template>

<script lang="ts">
import Cookies from "js-cookie";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";

import { useStore } from "./store";
import { SET_LAST_ENTRY, SET_USER_PREFS } from "./store/types";

export default defineComponent({
    name: "App",
    setup() {
        const $store = useStore();
        const $q = useQuasar();
        const $router = useRouter();

        onMounted(async () => {
            // Load user preferences from cookies
            const savedPrefs = Cookies.get("userPrefs");
            if (savedPrefs) {
                $store.commit(SET_USER_PREFS, JSON.parse(savedPrefs));
            }

            // Load last viewed entry from cookies
            const lastEntry = Cookies.get("lastEntry");
            if (lastEntry) {
                $store.commit(SET_LAST_ENTRY, lastEntry);
            }
        });

        watchEffect(() => {
            $q.dark.set($store.state.userPrefs.darkMode);
        });

        return {};
    },
});
</script>

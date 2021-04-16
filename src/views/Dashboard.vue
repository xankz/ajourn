<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated class="bg-primary text-white" v-if="currentJournal">
            <q-toolbar v-if="currentJournal">
                <q-btn icon="home" flat round @click="exitJournal"></q-btn>
                <q-toolbar-title>
                    {{ currentJournal.title }}
                </q-toolbar-title>
                <q-space></q-space>
                <div class="q-mr-md text-weight-medium">v{{ AppVersion }}</div>
                <q-btn icon="dark_mode" round flat @click="toggleDarkMode">
                    <q-tooltip>Toggle dark mode</q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-header>

        <q-drawer v-if="currentJournal" side="left" bordered padding show-if-above>
            <journal-drawer :currentJournal="currentJournalID" :entries="entries"></journal-drawer>
        </q-drawer>

        <q-page-container>
            <div class="q-ma-lg">
                <router-view name="view"></router-view>
            </div>
        </q-page-container>
    </q-layout>
</template>

<script>
import { useQuasar } from "quasar";
import { computed, defineComponent } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";

import JournalDrawer from "@/components/JournalDrawer";
import { AppVersion } from "@/constants";
import { useStore } from "@/store";
import { API_CLOSE_JOURNAL, SET_USER_PREFS } from "@/store/types";

export default defineComponent({
    name: "Dashboard",
    components: { JournalDrawer },
    setup() {
        const $store = useStore();
        const $q = useQuasar();
        const $router = useRouter();

        // Refs

        // Computed
        const currentJournal = computed(() => $store.getters.currentJournal);
        const currentJournalID = computed(() => $store.state.currentJournal);
        const entries = computed(() => $store.state.entries);

        // Functions
        const exitJournal = async () => {
            if (!currentJournal.value) return;
            await $store.dispatch(API_CLOSE_JOURNAL);
            await $router.push("/");
        };
        const toggleDarkMode = () => {
            $store.commit(SET_USER_PREFS, {
                darkMode: !$store.state.userPrefs.darkMode,
            });
        };

        // Effects
        onBeforeRouteLeave(async () => {
            await $store.dispatch(API_CLOSE_JOURNAL);
        });

        return {
            currentJournal,
            exitJournal,
            toggleDarkMode,
            entries,
            currentJournalID,
            AppVersion,
        };
    },
});
</script>

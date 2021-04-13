<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated class="bg-primary text-white" v-if="currentJournal">
            <q-toolbar>
                <q-btn icon="home" flat round @click="exitJournal"></q-btn>
                <q-toolbar-title>
                    {{ currentJournal.title }}
                </q-toolbar-title>
                <q-space></q-space>
                <q-btn icon="dark_mode" round flat @click="toggleDarkMode">
                    <q-tooltip>Toggle dark mode</q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-header>

        <q-drawer v-if="currentJournal" side="left" bordered padding show-if-above>
            <journal-drawer :currentJournal="currentJournalID" :entries="entries"></journal-drawer>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import Cookies from "js-cookie";
import { useQuasar } from "quasar";
import { computed, defineComponent, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";

import JournalDrawer from "@/components/JournalDrawer.vue";

import { useStore } from "./store";
import { API_CLOSE_JOURNAL, SET_USER_PREFS, UI_VISIBILITY, UserPrefs } from "./store/types";

export default defineComponent({
    name: "LayoutDefault",
    components: {
        JournalDrawer,
    },
    setup() {
        const $store = useStore();
        const $q = useQuasar();
        const $router = useRouter();

        onMounted(async () => {
            const savedPrefs = Cookies.get("userPrefs");
            if (savedPrefs) {
                $store.commit(SET_USER_PREFS, JSON.parse(savedPrefs));
            }
        });

        const exitJournal = async () => {
            if (!$store.state.currentJournal) return;
            await $store.dispatch(API_CLOSE_JOURNAL);
            await $router.push("/");
        };

        watchEffect(() => {
            $q.dark.set($store.state.userPrefs.darkMode);
        });

        return {
            currentJournalID: computed(() => $store.state.currentJournal),
            currentJournal: computed(() => $store.getters.currentJournal),
            showToolbar: computed(() => $store.state.showUi),
            showDrawer: computed(() => $store.state.showUi),
            entries: computed(() => $store.state.entries),
            exitJournal,
            toggleUi: () => {
                $store.commit(UI_VISIBILITY, !$store.state.showUi);
            },
            toggleDarkMode: () => {
                $store.commit(SET_USER_PREFS, {
                    darkMode: !$store.state.userPrefs.darkMode,
                } as Partial<UserPrefs>);
            },
        };
    },
});
</script>

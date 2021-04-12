<template>
    <div class="row items-center q-pt-xl">
        <div class="col-none col-sm-1 col-md-3"></div>
        <div class="col justify-center text-center">
            <h2 class="q-mb-sm">ajourn</h2>
            <p class="text-subtitle-1 text-italic">offline world planner.</p>
            <q-btn
                color="primary"
                label="New journal"
                icon="add"
                @click="openCreateJournal"
            ></q-btn>
            <hr class="q-my-xl" />
            <h6 class="text-grey" v-if="Object.keys(journals).length <= 0">
                No journals available.<br />
                <q-btn flat no-caps size="lg" class="text-primary" @click="openCreateJournal">
                    Make one?
                </q-btn>
            </h6>
            <q-list bordered separator v-else>
                <q-item v-for="(j, id) in journals" :key="id" clickable :to="'/j/' + id">
                    <q-item-section v-if="j.title">{{ j.title }}</q-item-section>
                    <q-item-section v-else class="text-italic text-grey"
                        >Unknown journal, ID: {{ id }})</q-item-section
                    >
                </q-item>
            </q-list>
        </div>
        <div class="col-none col-sm-1 col-md-3"></div>
    </div>
</template>

<script lang="ts">
import { useQuasar } from "quasar";
import { computed, defineComponent, onBeforeMount } from "vue";

import CreateJournalDialog from "@/components/CreateJournalDialog.vue";
import { useStore } from "@/store";
import { API_FETCH_JOURNALS } from "@/store/types";

export default defineComponent({
    name: "Landing",
    setup() {
        const $store = useStore();
        const $q = useQuasar();

        onBeforeMount(async () => {
            await $store.dispatch(API_FETCH_JOURNALS);
        });

        return {
            journals: computed(() => $store.state.journals),
            openCreateJournal: () => {
                $q.dialog({
                    component: CreateJournalDialog,
                });
            },
        };
    },
});
</script>

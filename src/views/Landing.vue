<template>
    <div class="row items-center q-pt-md">
        <div class="col-none col-sm-1 col-md-3"></div>
        <div class="col">
            <div class="row q-mb-md">
                <div class="col">
                    <div class="text-h3">
                        ajourn
                    </div>
                    <div class="text-caption text-italic q-mt-sm">
                        An offline world planner.
                    </div>
                </div>
                <div class="col row items-end justify-end">
                    <div>
                        Made with ☘️ by
                        <a
                            href="https://github.com/milkdazombie"
                            target="_blank"
                            class="text-weight-bold text-primary"
                            style="text-decoration: none"
                            >@kinesivan</a
                        >
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div class="col q-pr-md">
                        <div class="text-h6" v-if="numJournals <= 0">
                            No journals available.<br />
                            <q-btn
                                outline
                                no-caps
                                class="text-primary q-mt-sm"
                                @click="openCreateJournal"
                            >
                                Create a new journal
                            </q-btn>
                        </div>
                        <q-list dense bordered class="rounded-borders" separator v-else>
                            <q-item
                                v-for="(j, id) in journals"
                                :key="id"
                                clickable
                                :to="'/j/' + id"
                            >
                                <q-item-section avatar>
                                    <q-avatar icon="bookmark_border"></q-avatar>
                                </q-item-section>
                                <q-item-section v-if="j.title" class="text-weight-medium"
                                    >{{ j.title }}
                                </q-item-section>
                                <q-item-section v-else class="text-italic text-grey"
                                    >Unknown journal, ID: {{ id }})
                                </q-item-section>
                            </q-item>
                        </q-list>
                        <div class="text-caption q-mt-sm" v-if="numJournals">
                            Loaded {{ numJournals }} journal{{ numJournals > 1 ? "s" : "" }}.
                        </div>
                    </div>
                </div>
                <div class="col">
                    <change-log></change-log>
                </div>
            </div>
        </div>

        <div class="col-none col-sm-1 col-md-3"></div>
    </div>
</template>

<script lang="ts">
import { useQuasar } from "quasar";
import { computed, defineComponent, onBeforeMount } from "vue";

import ChangeLog from "@/components/ChangeLog.vue";
import CreateJournalDialog from "@/components/CreateJournalDialog.vue";
import { useStore } from "@/store";
import { API_FETCH_JOURNALS } from "@/store/types";

export default defineComponent({
    name: "Landing",
    components: {
        ChangeLog,
    },
    setup() {
        // Providers
        const $store = useStore();
        const $q = useQuasar();

        // Computed
        const journals = computed(() => $store.state.journals);
        const numJournals = computed(() => Object.keys($store.state.journals).length);

        // Effects
        onBeforeMount(async () => {
            await $store.dispatch(API_FETCH_JOURNALS);
        });

        return {
            journals,
            numJournals,
            openCreateJournal: () => {
                $q.dialog({
                    component: CreateJournalDialog,
                });
            },
        };
    },
});
</script>

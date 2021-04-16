import { Loading, Notify, QSpinnerGrid } from "quasar";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import EntryView from "@/components/EntryView.vue";
import { store } from "@/store";
import { API_FETCH_ENTRY, API_FETCH_JOURNALS, API_OPEN_JOURNAL } from "@/store/types";

import Dashboard from "../views/Dashboard.vue";
import Landing from "../views/Landing.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "Landing",
        component: Landing,
    },
    {
        path: "/j/:jid",
        name: "Dashboard",
        component: Dashboard,
        children: [
            {
                path: "e/:eid",
                name: "Entry",
                components: {
                    default: Dashboard,
                    view: EntryView,
                },
                beforeEnter: async (to, from, next) => {
                    // Fetch entry from database
                    try {
                        await store.dispatch(API_FETCH_ENTRY, { id: to.params.eid });
                        next();
                    } catch (e) {
                        Notify.create({ message: e.message, type: "negative" });
                        next(`/j/${to.params.jid}`);
                    }
                },
            },
        ],
        beforeEnter: async (to, from, next) => {
            // Show loading screen
            Loading.show({
                message: "Loading journal...",
                spinner: QSpinnerGrid,
            });

            // Fetch journal from database
            try {
                await store.dispatch(API_FETCH_JOURNALS);
                await store.dispatch(API_OPEN_JOURNAL, to.params.jid);
                next();
            } catch (e) {
                Notify.create({ message: e.message, type: "negative" });
                next("/");
            } finally {
                Loading.hide();
            }
        },
    },
];

const router = createRouter({
    history: createWebHistory(
        process.env.NODE_ENV === "production" ? process.env.BASE_URL + "/#" : process.env.BASE_URL
    ),
    routes,
});

export default router;

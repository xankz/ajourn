import "./registerServiceWorker";
import "leaflet/dist/leaflet.css";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet";
import "leaflet.fullscreen";

import screenfull from "screenfull";
window.screenfull = screenfull;

import { Quasar } from "quasar";
import { createApp } from "vue";
import vueDebounce from "vue-debounce";

import App from "./App.vue";
import { devtools } from "./devtools";
import quasarUserOptions from "./quasar-user-options";
import router from "./router";
import { key, store } from "./store";

const app = createApp(App)
    .use(devtools)
    .use(Quasar, quasarUserOptions)
    .use(store, key)
    .use(router)
    .use(vueDebounce, { listenTo: "input" })
    .mount("#app");

app.$options.devt;

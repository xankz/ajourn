import "./registerServiceWorker";
import "leaflet/dist/leaflet.css";
import "leaflet.fullscreen/Control.FullScreen.css";
import "vue-advanced-cropper/dist/style.css";
import "leaflet";
import "leaflet.fullscreen";

import { Quasar } from "quasar";
import screenfull from "screenfull";
import { createApp } from "vue";
import vueDebounce from "vue-debounce";
import VueMarkdownIt from "vue3-markdown-it";

import App from "./App.vue";
import { devtools } from "./devtools";
import quasarUserOptions from "./quasar-user-options";
import router from "./router";
import { key, store } from "./store";

window.screenfull = screenfull;

const app = createApp(App)
    .use(devtools)
    .use(Quasar, quasarUserOptions)
    .use(store, key)
    .use(router)
    .use(VueMarkdownIt as any)
    .use(vueDebounce, { listenTo: "input" })
    .mount("#app");

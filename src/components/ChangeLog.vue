<template>
    <q-banner
        dense
        rounded
        class="bg-warning q-mb-sm"
        v-if="latestVer != undefined && AppVersion != latestVer && !fetchErr"
    >
        Warning: you are using an older version of ajourn. <br />(current: {{ AppVersion }}, latest:
        {{ latestVer }})
    </q-banner>
    <q-card flat bordered>
        <q-card-section>
            <vue3-markdown-it class="md-changelog" :source="changes"></vue3-markdown-it>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { VueMarkdownIt } from "vue3-markdown-it";

import { AppVersion, ChangelogUrl } from "@/constants";

export default defineComponent({
    name: "ChangeLog",
    component: {
        VueMarkdownIt,
    },
    setup: () => {
        // Refs
        const changes = ref<string>("");
        const fetchErr = ref<string | undefined>();
        const latestVer = ref<string | undefined>(undefined);

        // Functions
        const fetchChangelog = async () => {
            try {
                const headers = new Headers();
                const res = await (
                    await fetch(`${ChangelogUrl}?cache-bust=${Math.random()}`, {
                        method: "GET",
                        cache: "no-store",
                        headers,
                    })
                ).text();

                // Find latest version
                const vers = res.split("\n").filter((l) => l.startsWith("## "));
                if (vers[0]) {
                    // Extract latest version from header
                    const m = vers[0].match(/\d+.\d+.\d+/m);
                    if (m && m[0]) {
                        latestVer.value = m[0];
                    } else {
                        throw new Error("Failed to retrieve latest version");
                    }

                    // Extract only latest version changes
                    if (vers[1]) {
                        const v1idx = res.indexOf(vers[0]);
                        const v2idx = res.indexOf(vers[1]);
                        changes.value = res.slice(v1idx, v2idx);
                    } else {
                        changes.value = res;
                    }
                }
            } catch (e) {
                fetchErr.value = e.message;
            }
        };

        // Effects
        onMounted(() => {
            fetchChangelog();
        });

        return {
            changes,
            latestVer,
            AppVersion,
        };
    },
});
</script>

<style lang="scss">
.md-changelog h1,
.md-changelog h2,
.md-changelog h4,
.md-changelog h5,
.md-changelog h6 {
    margin: 0;
}

.md-changelog h2 {
    font-weight: 500;
    font-size: 1.25rem;
    line-height: initial;
}

.md-changelog h3 {
    font-weight: 500;
    font-size: 1rem;
    line-height: initial;
    margin: 8px 0;
}

.md-changelog ul:last-child {
    margin-bottom: 0;
}
</style>

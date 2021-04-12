<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-form @submit.prevent="submit">
                <q-card-section>
                    <div class="text-h6">Create a new journal</div>
                </q-card-section>
                <q-card-section class="q-py-none">
                    <q-input
                        outlined
                        autofocus
                        placeholder="Title"
                        v-model="title"
                        :rules="[(val) => val.length >= 0 || 'Title is required']"
                    ></q-input>
                    <div class="column">
                        <q-checkbox label="Sync online" v-model="createOnline" disable>
                        </q-checkbox>
                        <small class="text-grey"> Log in to enable online sync. </small>
                    </div>
                </q-card-section>
                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" type="button" @click="onCancelClick"></q-btn>
                    <q-btn
                        flat
                        label="Create"
                        type="submit"
                        :loading="loading"
                        :disable="title.length <= 0"
                    ></q-btn>
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent, useQuasar } from "quasar";
import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";

import { useStore } from "@/store";
import { API_CREATE_JOURNAL, API_OPEN_JOURNAL, CreateJournal } from "@/store/types";

export default defineComponent({
    name: "CreateJournalDialog",
    emits: [
        // REQUIRED; need to specify some events that your
        // component will emit through useDialogPluginComponent()
        ...useDialogPluginComponent.emits,
    ],
    setup() {
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $q = useQuasar();
        const $store = useStore();
        const $router = useRouter();

        const title = ref("");
        const submit = async () => {
            try {
                const id = await $store.dispatch(API_CREATE_JOURNAL, {
                    title: title.value,
                } as CreateJournal);
                await $store.dispatch(API_OPEN_JOURNAL, id);
                await $router.push(`/j/${id}`);
                onDialogOK();
            } catch (e) {
                $q.notify(e);
            }
        };

        return {
            dialogRef,
            onDialogHide,

            // stub: true only if user logged in
            createOnline: ref(false),
            title,
            loading: ref(false),
            submit,

            // other methods that we used in our vue html template;
            // these are part of our example (so not required)
            onOKClick() {
                submit();
                onDialogOK();
            },

            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
        };
    },
});
</script>

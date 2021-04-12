<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <form @submit.prevent="submit">
                <q-card-section>
                    <div class="text-h6">Create a new entry</div>
                </q-card-section>
                <q-card-section class="q-pt-none row items-center">
                    <q-avatar
                        :icon="avatar.data"
                        class="q-mr-md cursor-pointer"
                        rounded
                        color="grey-4"
                        text-color="dark"
                        size="56px"
                        v-if="avatar.type == 'icon'"
                    >
                        <q-tooltip>Change entry avatar</q-tooltip>
                        <q-popup-proxy max-width="200px" v-model="showIconDialog">
                            <entry-icon-dialog @attach="updateAvatar"></entry-icon-dialog>
                        </q-popup-proxy>
                    </q-avatar>
                    <q-avatar
                        v-else
                        class="q-mr-md cursor-pointer"
                        rounded
                        color="grey-4"
                        text-color="dark"
                        size="56px"
                    >
                        <q-tooltip>Change entry avatar</q-tooltip>
                        <img :src="avatar.data" />
                        <q-popup-proxy max-width="200px" v-model="showIconDialog">
                            <entry-icon-dialog @attach="updateAvatar"></entry-icon-dialog>
                        </q-popup-proxy>
                    </q-avatar>
                    <q-input
                        placeholder="Untitled entry"
                        outlined
                        autofocus
                        class="col"
                        v-model="title"
                    ></q-input>
                </q-card-section>
                <q-card-section>
                    <q-select
                        label="In category..."
                        outlined
                        dense
                        multiple
                        v-model="category"
                        :options="categories"
                        new-value-mode="add-unique"
                        option-label="name"
                        options-dense
                        option-value="id"
                        emit-value
                        map-options
                        use-chips
                    >
                        <template v-slot:no-option>
                            <q-item dense>
                                <q-item-section class="text-italic text-grey">
                                    No categories
                                </q-item-section>
                            </q-item>
                        </template>
                        <template v-slot:after>
                            <q-btn
                                outline
                                icon="add"
                                color="primary"
                                class="full-height"
                                @click="openManageCategories"
                            >
                                <q-tooltip>Create a new category</q-tooltip>
                            </q-btn>
                        </template>
                    </q-select>
                </q-card-section>
                <q-expansion-item label="Additional settings" dense>
                    <q-card-section>
                        <q-select
                            label="From template..."
                            v-model="template"
                            outlined
                            dense
                        ></q-select>
                    </q-card-section>
                </q-expansion-item>
                <q-card-actions align="right" class="text-primary">
                    <q-btn
                        flat
                        label="Create"
                        type="submit"
                        :disable="title.length <= 0"
                        :loading="loading"
                    >
                        <template v-slot:loading>
                            <q-spinner-dots class="on-left" />
                        </template>
                    </q-btn>
                    <q-btn flat label="Cancel" @click="onCancelClick" />
                </q-card-actions>
            </form>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { QDialog, useDialogPluginComponent, useQuasar } from "quasar";
import { computed, defineComponent, reactive, ref, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";

import EntryIconDialog from "@/components/EntryIconDialog.vue";
import { useStore } from "@/store";
import {
    API_ADD_ENTRY_ATTACHMENT,
    API_CREATE_ENTRY,
    CreateAttachment,
    Entry,
    EntryAvatar,
} from "@/store/types";

import ManageCategoriesDialog from "./ManageCategoriesDialog.vue";

interface CreateEntryDialogData {
    avatar: EntryAvatar;
    title: string;
    category: string[];
    template: string;
    showIconDialog: boolean;
    loading: boolean;
}

export default defineComponent({
    name: "CreateEntryDialog",
    components: {
        EntryIconDialog,
    },
    emits: [
        // REQUIRED; need to specify some events that your
        // component will emit through useDialogPluginComponent()
        ...useDialogPluginComponent.emits,
    ],
    setup: () => {
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $q = useQuasar();
        const $store = useStore();
        const $router = useRouter();
        const $route = useRoute();

        const avatarFile = ref<File | undefined>(undefined);
        const state = {
            avatar: ref<EntryAvatar>({ type: "icon", data: "subject" }),
            title: ref(""),
            categories: computed(() =>
                $store.state.currentJournal
                    ? $store.state.journals[$store.state.currentJournal].categories
                    : []
            ),
            category: ref([]),
            template: ref(""),
            loading: ref(false),
            showIconDialog: ref(false),
        };

        const submit = async () => {
            state.loading.value = true;
            try {
                if (state.avatar.value.type == "attachment") {
                    if (!avatarFile.value) {
                        throw new Error("Avatar never uploaded");
                    }
                    const e = {
                        title: state.title.value,
                        avatar: { type: "attachment", data: "avatar" },
                        category: state.category.value,
                    } as Partial<Entry>;
                    const e2 = await $store.dispatch(API_CREATE_ENTRY, e);
                    await $store.dispatch(API_ADD_ENTRY_ATTACHMENT, {
                        id: e2.id,
                        attachment: {
                            name: "avatar",
                            data: avatarFile.value,
                        } as CreateAttachment,
                    });
                    console.log($route.params.jid, e2.id);
                    await $router.push(`/j/${$route.params.jid}/e/${e2.id}`);
                } else {
                    const e = {
                        title: state.title.value,
                        avatar: state.avatar.value,
                        category: state.category.value,
                    } as Partial<Entry>;
                    const e2 = await $store.dispatch(API_CREATE_ENTRY, e);
                    await $router.push(`/j/${$route.params.jid}/e/${e2.id}`);
                }
                onDialogOK();
            } catch (e) {
                $q.notify({ type: "negative", message: e.message });
            } finally {
                state.loading.value = false;
            }
        };

        const updateAvatar = (data: {
            type: "image" | "icon" | "attachment";
            data: string | File;
        }) => {
            // Hide icon dialog
            state.showIconDialog.value = false;
            if (data.type === "image") {
                const fr = new FileReader();
                fr.onload = () => {
                    if (fr.result == null) {
                        $q.notify({ type: "negative", message: "Failed to load avatar" });
                        return;
                    }
                    state.avatar.value = { type: "attachment", data: fr.result };
                };
                avatarFile.value = data.data as File;
                fr.readAsDataURL(data.data as File);
            } else if (data.type === "icon") {
                avatarFile.value = undefined;
                state.avatar.value = { type: "icon", data: data.data as string };
            }
        };

        const openManageCategories = () => {
            $q.dialog({
                component: ManageCategoriesDialog,
            });
        };

        return {
            dialogRef,
            onDialogHide,
            ...state,
            submit,
            updateAvatar,
            onOKClick() {
                submit();
                onDialogOK();
                // or with payload: onDialogOK({ ... })
                // ...and it will also hide the dialog automatically
            },
            openManageCategories,

            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
        };
    },
});
</script>

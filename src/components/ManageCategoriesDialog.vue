<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin">
            <q-card-section class="row align-items-center">
                <div class="text-h6">Manage categories</div>
                <q-space></q-space>
                <q-btn icon="add" color="primary" flat round dense @click="addCategory">
                    <q-tooltip>Create a new category</q-tooltip>
                </q-btn>
            </q-card-section>
            <q-card-section>
                <q-list
                    bordered
                    class="rounded-borders"
                    style="overflow: auto; max-height: 300px"
                    v-if="categories.length"
                >
                    <template v-for="(c, idx) in categories" :key="c.id">
                        <q-expansion-item
                            expand-separator
                            :label="c.name ? c.name : '[ Untitled category ]'"
                            icon="circle"
                            caption="0 entries"
                            :header-style="c.color ? { color: c.color } : {}"
                            group="categories"
                        >
                            <q-card>
                                <q-card-section>
                                    <q-input
                                        outlined
                                        dense
                                        label="Name"
                                        v-model="c.name"
                                        class="q-mb-sm"
                                        :rules="[(val) => !!val || 'Please input a valid name']"
                                        hide-bottom-space
                                    >
                                        <template v-slot:after>
                                            <q-btn
                                                style="height: 100%"
                                                icon="delete_outline"
                                                outline
                                                color="red"
                                                @click="deleteCategory(idx)"
                                            ></q-btn>
                                        </template>
                                    </q-input>
                                    <q-input
                                        outlined
                                        dense
                                        v-model="c.color"
                                        label="Color"
                                        class="q-mb-sm"
                                    >
                                        <template v-slot:append>
                                            <q-icon name="colorize" class="cursor-pointer">
                                                <q-popup-proxy
                                                    transition-show="scale"
                                                    transition-hide="scale"
                                                >
                                                    <q-color v-model="c.color" />
                                                </q-popup-proxy>
                                            </q-icon>
                                        </template>
                                    </q-input>
                                    <div class="row q-gutter-sm no-wrap">
                                        <q-input
                                            outlined
                                            dense
                                            :disable="true"
                                            v-model="c.labelSingular"
                                            label="Singular label"
                                            stack-label
                                            :placeholder="pluralize.singular(c.name)"
                                        >
                                        </q-input>
                                        <q-input
                                            outlined
                                            dense
                                            :disable="true"
                                            v-model="c.labelPlural"
                                            label="Plural label"
                                            :placeholder="namePluralized"
                                            stack-label
                                        >
                                        </q-input>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </q-expansion-item>
                        <q-separator v-if="idx != categories.length - 1"></q-separator>
                    </template>
                </q-list>
                <div class="text-body1 text-grey" v-else>
                    No categories indexed for this journal.
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn color="primary" flat label="Save changes" @click="saveChanges" />
                <q-btn color="primary" flat label="Cancel" @click="onCancelClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { cloneDeep } from "lodash";
import pluralize from "pluralize";
import { useDialogPluginComponent, useQuasar } from "quasar";
import randomColor from "randomcolor";
import shortid from "short-uuid";
import { computed, defineComponent, ref, unref } from "vue";

import { useStore } from "@/store";
import { API_UPDATE_JOURNAL, Category } from "@/store/types";

import DeleteCategoryDialog from "./DeleteCategoryDialog.vue";

export default defineComponent({
    name: "ManageCategoriesDialog",
    props: {},

    emits: [...useDialogPluginComponent.emits],

    setup() {
        // Providers
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $store = useStore();
        const $q = useQuasar();

        // Refs
        const categories = ref<Category[]>(
            $store.getters.currentJournal ? cloneDeep($store.getters.currentJournal.categories) : []
        );

        // Computed
        const namePluralized = computed((idx: number) =>
            categories.value[idx] ? pluralize(categories.value[idx].name) : ""
        );

        // Functions
        const addCategory = () => {
            categories.value.unshift({
                name: "Untitled category",
                labelSingular: "",
                labelPlural: "",
                color: randomColor({ luminosity: "dark" }),
                id: shortid.generate(),
            });
        };
        const deleteCategory = (idx: number) => {
            const c = categories.value[idx];
            if (!c) return;

            $q.dialog({
                component: DeleteCategoryDialog,
                componentProps: {
                    category: c.name,
                },
            }).onOk(() => {
                categories.value.splice(idx, 1);
            });
        };

        const saveChanges = async () => {
            try {
                await $store.dispatch(API_UPDATE_JOURNAL, { categories: unref(categories) });
                onDialogOK();
            } catch (e) {
                console.error(e);
                $q.notify({ message: e.message, type: "negative" });
            }
        };

        return {
            dialogRef,
            onDialogHide,
            categories,
            addCategory,
            pluralize,
            deleteCategory,
            namePluralized,
            saveChanges,

            onCancelClick: onDialogCancel,
        };
    },
});
</script>

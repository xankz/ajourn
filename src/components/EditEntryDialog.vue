<template>
    <!-- notice dialogRef here -->
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin" style="width: 800px">
            <q-card-section class="row align-items-center">
                <div class="text-h6">Editing "{{ entryModel.title }}"</div>
                <q-space></q-space>
                <q-btn
                    icon="add"
                    color="primary"
                    flat
                    round
                    dense
                    class="q-mr-sm"
                    @click="createFieldTooltip = false"
                >
                    <q-popup-proxy v-model="createFieldPopup">
                        <q-list>
                            <q-item class="q-px-sm q-pb-none">
                                <q-input
                                    label="Search fields..."
                                    outlined
                                    dense
                                    autofocus
                                    v-model="createFieldTreeFilter"
                                    :ref="createFieldTreeFilterRef"
                                ></q-input>
                            </q-item>
                            <q-item class="q-px-sm">
                                <q-tree
                                    class="full-width"
                                    :nodes="createFieldTree"
                                    node-key="fieldType"
                                    :filter="createFieldTreeFilter"
                                    v-model:expanded="createFieldTreeExpanded"
                                    v-model:selected="createFieldTreeSelected"
                                    @update:selected="onCreateFieldSubmit"
                                ></q-tree>
                            </q-item>
                        </q-list>
                    </q-popup-proxy>
                    <q-tooltip v-model="createFieldTooltip">Create a new field</q-tooltip>
                </q-btn>
                <q-btn
                    icon="delete_outline"
                    color="negative"
                    flat
                    round
                    dense
                    class="q-mr-sm"
                    @click="deleteEntry"
                >
                    <q-tooltip>Delete "{{ entryModel.title }}"</q-tooltip>
                </q-btn>
                <q-btn icon="close" flat round dense v-close-popup>
                    <q-tooltip>Cancel editing</q-tooltip>
                </q-btn>
            </q-card-section>
            <div class="row">
                <div class="col col-md-6">
                    <q-card-section class="q-pt-none">
                        <q-tree
                            :nodes="fieldTree"
                            node-key="key"
                            selected-color="primary"
                            v-model:selected="fieldTreeSelected"
                            v-model:expanded="fieldTreeExpanded"
                            ref="fieldTreeRef"
                            accordion
                        >
                            <template v-slot:default-header="prop">
                                <div class="row items-center">
                                    <q-icon
                                        v-if="prop.node.icon"
                                        :name="prop.node.icon"
                                        size="20px"
                                        class="q-mr-sm"
                                        :class="{
                                            'text-red':
                                                !prop.node.label || prop.node.icon == 'warning',
                                        }"
                                    />
                                    <q-img
                                        v-else
                                        :src="prop.node.avatar"
                                        width="20px"
                                        class="rounded-borders q-mr-sm"
                                    ></q-img>
                                    <div
                                        v-if="prop.node.label"
                                        :class="{ 'text-red': prop.node.icon == 'warning' }"
                                    >
                                        {{ prop.node.label }}
                                    </div>
                                    <div v-else class="text-italic text-red">Untitled field</div>
                                </div>
                            </template>
                        </q-tree>
                    </q-card-section>
                </div>
                <div class="col col-md-6" v-if="fieldTreeSelected === 'entry'">
                    <q-card-section class="q-pt-none">
                        <q-form>
                            <div class="row items-center">
                                <q-avatar
                                    :icon="entryModel.avatar.data"
                                    class="q-mr-sm cursor-pointer"
                                    rounded
                                    color="grey-4"
                                    text-color="dark"
                                    size="56px"
                                    v-if="entryModel.avatar.type === 'icon'"
                                >
                                    <q-tooltip>Change entry avatar</q-tooltip>
                                    <q-popup-proxy
                                        max-width="200px"
                                        v-model="showEntryAvatarDialog"
                                    >
                                        <entry-icon-dialog
                                            :entry="entry"
                                            useAttachments
                                            @attach="updateEntryAvatar"
                                        ></entry-icon-dialog>
                                    </q-popup-proxy>
                                </q-avatar>
                                <q-avatar
                                    v-else
                                    class="q-mr-sm cursor-pointer"
                                    rounded
                                    color="grey-4"
                                    text-color="dark"
                                    size="56px"
                                >
                                    <q-tooltip>Change entry avatar</q-tooltip>
                                    <img :src="entryAvatar" />
                                    <q-popup-proxy
                                        max-width="200px"
                                        v-model="showEntryAvatarDialog"
                                    >
                                        <entry-icon-dialog
                                            :entry="entry"
                                            useAttachments
                                            @attach="updateEntryAvatar"
                                        ></entry-icon-dialog>
                                    </q-popup-proxy>
                                </q-avatar>
                                <q-input
                                    label="Title"
                                    outlined
                                    class="col-grow"
                                    v-model="entryModel.title"
                                ></q-input>
                            </div>
                            <q-select
                                label="In category..."
                                outlined
                                class="q-mt-sm"
                                dense
                                multiple
                                v-model="entryModel.category"
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
                            </q-select>
                        </q-form>
                    </q-card-section>
                </div>
                <div class="col col-md-6" v-else-if="currentField">
                    <q-card-section class="q-pt-none">
                        <q-form>
                            <q-input
                                label="Name"
                                outlined
                                dense
                                v-model="currentField.name"
                                ref="currentFieldName"
                            >
                            </q-input>
                            <q-separator class="q-my-md"></q-separator>
                            <component
                                :is="getComponentFromField(currentField.type)"
                                :editView="true"
                                :entry="entryModel"
                                v-model="currentField"
                            ></component>
                            <div class="row q-mt-md">
                                <q-btn-group flat>
                                    <q-btn
                                        color="primary"
                                        flat
                                        icon="north"
                                        @click="moveCurrentField(-1)"
                                        class="q-px-sm"
                                    ></q-btn>
                                    <q-btn
                                        color="primary"
                                        flat
                                        icon="south"
                                        class="q-px-sm"
                                        @click="moveCurrentField(1)"
                                    ></q-btn>
                                </q-btn-group>
                                <q-btn
                                    class="q-ml-auto"
                                    color="negative"
                                    flat
                                    label="Delete field"
                                    @click="deleteField"
                                ></q-btn>
                            </div>
                        </q-form>
                    </q-card-section>
                </div>
                <div
                    class="col col-md-6 text-h6 align-items-center q-px-lg q-py-xl text-grey"
                    v-else
                >
                    <template v-if="entryModel.fields.length">
                        Select a field to view more information
                    </template>
                    <template v-else>Create a field to get started</template>
                </div>
            </div>
            <q-card-actions align="right">
                <q-btn color="primary" flat label="Save changes" @click="submit" />
                <q-btn color="primary" flat label="Cancel" @click="onCancelClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { nanoid } from "nanoid";
import { QInput, QTree, useDialogPluginComponent, useQuasar } from "quasar";
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { CreateFieldTree, FieldDefs } from "@/constants";
import { useStore } from "@/store";
import { API_DELETE_ENTRY, API_UPDATE_ENTRY, Entry, Field, FieldType } from "@/store/types";

import DeleteEntryDialog from "./DeleteEntryDialog.vue";
import EntryIconDialog from "./EntryIconDialog.vue";
import ErrorField from "./fields/ErrorField.vue";

export default defineComponent({
    name: "EditEntryDialog",
    props: {
        entry: {
            type: Object as PropType<Entry>,
            required: true,
        },
        entryID: {
            type: String,
            required: true,
        },
    },

    emits: [...useDialogPluginComponent.emits],

    components: { EntryIconDialog },

    setup(props) {
        // REQUIRED; must be called inside of setup()
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
        const $q = useQuasar();
        const $store = useStore();
        const $router = useRouter();

        const entryModel = reactive({ ...props.entry });
        const currentFieldName = ref<QInput | null>(null);

        const entryAvatar = computed(() =>
            $store.getters.entryAttachment(props.entryID, entryModel.avatar.data)
        );

        const mapKeyToModel = (key: string): Field | undefined => {
            if (!key) {
                return undefined;
            }
            for (let i = 0; i < entryModel.fields.length; i++) {
                if (!entryModel.fields[i]) {
                    continue;
                }
                if (key == entryModel.fields[i].id) {
                    return entryModel.fields[i];
                }
            }
            return undefined;
        };

        const setModelFromKey = (key: string, v: Field) => {
            if (!key) {
                return;
            }
            for (let i = 0; i < entryModel.fields.length; i++) {
                if (!entryModel.fields[i]) {
                    continue;
                }
                if (key == entryModel.fields[i].id) {
                    entryModel.fields[i] = v;
                }
            }
            return;
        };

        const mapFieldToIcon = (t: FieldType): string => {
            if (t in FieldDefs) {
                return FieldDefs[t].icon;
            } else {
                return "help";
            }
        };

        const fieldTreeRef = ref<QTree | null>(null);
        const fieldTreeSelected = ref<string | null>(null);
        const fieldTreeExpanded = ref<string[]>(["entry"]);
        const createFieldPopup = ref(false);
        const createFieldTreeSelected = ref(null);
        const currentField = computed({
            get: () => mapKeyToModel(fieldTreeSelected.value as string),
            set: (v) => {
                if (!v) {
                    return;
                }
                setModelFromKey(fieldTreeSelected.value as string, v);
            },
        });
        const showEntryAvatarDialog = ref(false);
        const currentJournal = computed(() => $store.state.currentJournal);

        const moveCurrentField = (delta: number) => {
            if (!currentField.value) return;
            const index = entryModel.fields.indexOf(currentField.value);
            if (index === -1) return;
            const newIndex = index + delta;
            if (newIndex < 0 || newIndex === entryModel.fields.length) return;
            const indexes = [index, newIndex].sort();
            entryModel.fields.splice(
                indexes[0],
                2,
                entryModel.fields[indexes[1]],
                entryModel.fields[indexes[0]]
            );
        };

        const genFieldTree = (model: Entry) => {
            const head = {
                label: model.title,
                avatar: model.avatar.type == "attachment" ? entryAvatar.value : undefined,
                icon: model.avatar.type == "icon" ? model.avatar.data : undefined,
                children: [] as object,
                key: "entry",
            };
            head.children = model.fields.map((f) => {
                if (!f) {
                    return {
                        label: "Broken field",
                        key: nanoid(13),
                        icon: "warning",
                    };
                }
                switch (f.type) {
                    default:
                        return { label: f.name, key: f.id, icon: mapFieldToIcon(f.type) };
                }
            });
            return [head];
        };

        const deleteEntry = () => {
            $q.dialog({
                component: DeleteEntryDialog,
                componentProps: {
                    entry: entryModel,
                },
            }).onOk(async () => {
                try {
                    await $store.dispatch(API_DELETE_ENTRY, props.entryID);
                    onDialogOK();
                    $router.push(`/j/${currentJournal.value}`);
                } catch (e) {
                    $q.notify({ message: e.message, type: "negative" });
                }
            });
        };

        const updateEntryAvatar = (att: {
            type: "image" | "icon" | "attachment";
            data: string | File;
        }) => {
            showEntryAvatarDialog.value = false;
            if (att.type === "image") return;
            entryModel.avatar = { type: att.type, data: att.data as string };
        };

        const deleteField = () => {
            if (!currentField.value) {
                return;
            }
            $q.dialog({
                title: `Delete field "${currentField.value.name}"`,
                message: `Are you sure you want to delete "${currentField.value.name}"? This action cannot be undone!`,
                cancel: true,
                persistent: true,
                ok: {
                    color: "red",
                    label: "Delete",
                    flat: true,
                },
            }).onOk(() => {
                // Delete field from `entry` model
                for (let i = 0; i < entryModel.fields.length; i++) {
                    if (currentField.value?.id == entryModel.fields[i].id) {
                        // delete entryModel.fields[i];
                        entryModel.fields = entryModel.fields.filter(
                            (f) => f.id != currentField.value?.id
                        );
                        break;
                    }
                }
            });
        };

        const submitCreateField = (t: FieldType) => {
            const id = nanoid(13);
            const f = { ...FieldDefs[t].default, type: t, id } as Field;
            entryModel.fields.push(f);
            createFieldTreeSelected.value = null;
            fieldTreeSelected.value = f.id;
            createFieldPopup.value = false;

            // Re-expand field tree if not already expanded
            if (!fieldTreeExpanded.value.includes("entry")) {
                fieldTreeExpanded.value.push("entry");
            }

            // Focus name field
            if (currentFieldName.value) {
                currentFieldName.value.focus();
            }
        };

        const getComponentFromField = (t: FieldType) => {
            if (t in FieldDefs) {
                return FieldDefs[t].component;
            } else {
                return ErrorField;
            }
        };

        const state = {
            entryModel,
            currentField,
            fieldTreeRef,
            fieldTree: computed(() => genFieldTree(entryModel)),
            fieldTreeSelected,
            fieldTreeExpanded,
            createFieldTree: CreateFieldTree,
            createFieldTooltip: ref(false),
            createFieldPopup,
            createFieldTreeExpanded: ref(["_"]), // "_" fieldType special flag
            createFieldTreeFilter: ref(""),
            createFieldTreeFilterRef: ref(null),
            createFieldTreeSelected,
            getComponentFromField,
            submitCreateField,
            onCreateFieldSubmit: (t: FieldType) => {
                submitCreateField(t);
            },
            categories: computed(() =>
                $store.state.currentJournal
                    ? $store.state.journals[$store.state.currentJournal].categories
                    : []
            ),
        };

        const submit = async () => {
            // Update entry
            try {
                await $store.dispatch(API_UPDATE_ENTRY, { id: props.entryID, data: entryModel });
                onDialogOK();
            } catch (e) {
                $q.notify({ message: e, type: "negative" });
            }
        };

        return {
            // This is REQUIRED;
            // Need to inject these (from useDialogPluginComponent() call)
            // into the vue scope for the vue html template
            dialogRef,
            onDialogHide,

            ...state,
            submit,
            currentFieldName,
            deleteField,
            deleteEntry,
            entryAvatar,
            showEntryAvatarDialog,
            moveCurrentField,
            updateEntryAvatar,

            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
        };
    },
});
</script>

<style lang="scss" scoped>
.q-tree > .q-tree__node--child > .q-tree__node-header {
    padding-left: 0;
}
</style>

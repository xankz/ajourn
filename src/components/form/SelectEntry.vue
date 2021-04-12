<template>
    <q-select
        v-bind="attrs"
        label="Select an entry"
        :options="selectOpts"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
        :option-value="(opt) => (opt !== undefined ? opt.id : '')"
        emit-value
        :multiple="multiple"
        map-options
    >
        <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
                <q-item-section avatar style="min-width: 0">
                    <q-avatar rounded v-if="scope.opt.avatar.type === 'attachment'" size="24px">
                        <img :src="scope.opt.avatar.data" />
                    </q-avatar>
                    <q-avatar
                        v-else
                        text-color="primary"
                        rounded
                        :icon="scope.opt.avatar.data"
                        size="24px"
                    ></q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
            </q-item>
        </template>
        <template v-slot:prepend v-if="!multiple">
            <q-avatar rounded v-if="currentOpt && currentOpt.avatar.type === 'attachment'">
                <img :src="currentOpt.avatar.data" />
            </q-avatar>
            <q-avatar
                v-else-if="currentOpt && currentOpt.avatar.type === 'icon'"
                text-color="primary"
                rounded
                :icon="currentOpt.avatar.data"
            ></q-avatar>
        </template>
    </q-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

import { useStore } from "@/store";

export default defineComponent({
    name: "SelectEntry",
    props: {
        modelValue: {
            type: Object as PropType<string | Array<string>>,
            required: true,
        },
        multiple: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue"],
    setup: (props, ctx) => {
        // Providers
        const $store = useStore();

        // Computed
        const selectOpts = computed(() =>
            Object.entries($store.state.entries).map((e) => {
                const avatar =
                    e[1].avatar.type === "attachment"
                        ? $store.getters.entryAttachment(e[1].id, e[1].avatar.data as string)
                        : e[1].avatar.data;
                return {
                    label: e[1].title,
                    avatar: {
                        type: e[1].avatar.type,
                        data: avatar,
                    },
                    id: e[1].id,
                };
            })
        );
        const currentOpt = computed(() => selectOpts.value.find((o) => o.id === props.modelValue));

        // Functions
        const updateValue = (val: { id: string }) => {
            ctx.emit("update:modelValue", val);
        };

        return {
            attrs: ctx.attrs,
            updateValue,
            selectOpts,
            currentOpt,
        };
    },
});
</script>

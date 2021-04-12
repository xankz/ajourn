<template>
    <div
        style="border-radius: 3px"
        :class="hasChildren ? 'q-tree__node--link' : 'q-tree__node--link q-treeview-node--leaf'"
    >
        <div style="padding-top: 6px" class="row q-treeview-node__root" @click="open = !open">
            <q-icon
                size="sm"
                v-if="hasChildren"
                name="arrow_right"
                :class="open ? 'text-grey-8 q-tree__arrow--rotate' : 'text-grey-8'"
            />
            <slot name="left" v-bind="{ item: value, open }" />
            <slot v-if="hasDefaultSlot" name="body" v-bind="{ item: value, open }" />
            <div v-if="!hasDefaultSlot" class="q-tree__node-header-content q-pa-xs">
                {{ value.label }}
            </div>
        </div>
        <div
            v-if="open && value.children && value.children.length > 0"
            class="q-tree__children"
            style="padding-top: 6px"
        >
            <draggable
                :modelValue="value.children"
                ghost-class="ghost"
                @update:modelValue="updateValue"
                :group="group"
                :itemKey="rowKey"
                :move="checkMove"
                @start="drag = true"
                @end="drag = false"
            >
                <template #item="{ element }">
                    <q-draggable-tree-node
                        :rowKey="rowKey"
                        :value="element"
                        @update:value="updateChildValue"
                        :group="group"
                    >
                        <template v-slot:left="{ item, open }">
                            <slot name="left" v-bind="{ item, open }"></slot>
                        </template>
                        <template v-if="hasDefaultSlot" v-slot:body="{ item, open }">
                            <slot name="body" v-bind="{ item, open }"></slot>
                        </template>
                        <span v-if="!hasDefaultSlot">{{ item.label }}</span>
                    </q-draggable-tree-node>
                </template>
            </draggable>
        </div>
        <div v-else class="q-tree__children">
            <draggable
                :modelValue="value.children"
                ghost-class="ghost"
                @update:modelValue="updateValue"
                :group="group"
                class="dragArea"
                :itemKey="rowKey"
                v-bind="dragOptions"
                :move="checkMove"
                @start="drag = true"
                @end="drag = false"
            >
                <template #item> </template>
            </draggable>
        </div>
    </div>
</template>

<script>
import { nanoid } from "nanoid";
import Draggable from "vuedraggable";

export default {
    name: "QDraggableTreeNode",
    components: {
        Draggable,
    },
    emits: ["update:value"],
    props: {
        value: {
            type: Object,
            default: () => ({
                key: nanoid(13),
                name: "",
                children: [],
            }),
        },
        root: {
            type: Boolean,
            default: () => false,
        },
        group: {
            type: String,
            default: null,
        },
        rowKey: {
            type: String,
            default: "key",
        },
    },
    data() {
        return {
            open: true,
            drag: false,
            localValue: Object.assign({}, this.value),
        };
    },
    computed: {
        hasChildren() {
            return this.value.children != null && this.value.children.length > 0;
        },
        isDark() {
            return "";
        },
        hasDefaultSlot() {
            // eslint-disable-next-line no-prototype-builtins
            return this.$slots.hasOwnProperty("body");
        },
        dragOptions: () => {
            return {
                animation: 200,
                group: "fields",
                emptyInsertThreshold: 10,
                disabled: false,
                ghostClass: "ghost",
            };
        },
    },
    watch: {
        value(value) {
            this.localValue = Object.assign({}, value);
        },
    },
    methods: {
        updateValue(value) {
            console.log("oop");
            if (value.constructor === Array) {
                this.localValue.children = [...value];
                this.$emit("update:value", this.localValue);
                this.open = true;
            }
        },
        checkMove(d) {
            console.log(d);
            return true;
        },
        updateChildValue(value) {
            const index = this.localValue.children.findIndex(
                (c) => c[this.rowKey] === value[this.rowKey]
            );
            this.$set(this.localValue.children, index, value);
            this.$emit("update:value", this.localValue);
        },
    },
};
</script>

<style scoped>
.ghost {
    opacity: 0.5;
    background: lightgray;
}

.list-group {
    min-height: 20px;
}

.list-group-item {
    cursor: move;
}

.list-group-item i {
    cursor: pointer;
}

.dragArea {
    min-height: 11px;
}
</style>

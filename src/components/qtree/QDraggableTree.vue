<template>
    <div class="q-pa-md q-gutter-sm">
        <!-- <draggable-->
        <!--      :value="localValue"-->
        <!--      :group="group"-->
        <!--      v-model="treeData"-->
        <!--      class="q-tree q-tree-draggable"-->
        <!--      ghost-class="ghost"-->
        <!--      @input="updateValue"-->
        <!--      @start="drag = true"-->
        <!--      @end="drag = false"-->
        <!--    > -->
        <q-draggable-tree-node
            v-for="item in treeData"
            :key="item.key"
            :value="item"
            :group="group"
            @update:value="updateItem"
            :rowKey="rowKey"
        >
            <template v-slot:left="{ item, open }">
                <slot name="left" v-bind="{ item, open }"></slot>
            </template>
            <template v-if="hasDefaultSlot" v-slot:body="{ item, open }">
                <slot name="body" v-bind="{ item, open }"></slot>
            </template>
            <span v-if="!hasDefaultSlot">{{ item }}</span>
        </q-draggable-tree-node>
        <!--    </draggable>-->
    </div>
</template>

<script>
import Draggable from "vuedraggable";

import QDraggableTreeNode from "./QDraggableTreeNode.vue";

export default {
    components: {
        // eslint-disable-next-line vue/no-unused-components
        Draggable,
        QDraggableTreeNode,
    },
    emits: ["update:data"],
    props: {
        data: {
            type: Array,
            default: () => {
                return [];
            },
        },
        group: {
            type: String,
            default: null,
        },
        rowKey: {
            type: String,
            default: "label",
        },
    },
    data() {
        return {
            drag: false,
            localValue: [...this.data],
        };
    },
    computed: {
        treeData: {
            get() {
                return this.data;
            },
            set(val) {
                // We should not update original data
            },
        },
        themeClassName() {
            return "theme--dark";
        },
        hasDefaultSlot() {
            // eslint-disable-next-line no-prototype-builtins
            return this.$slots.hasOwnProperty("body");
        },
        dragOptions() {
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
            this.localValue = [...value];
        },
    },
    methods: {
        updateValue(value) {
            this.localValue = value;
            this.$emit("update:data", this.localValue);
        },
        updateItem(itemValue) {
            const index = this.localValue.findIndex(
                (v) => v[this.rowKey] === itemValue[this.rowKey]
            );
            this.$set(this.localValue, index, itemValue);
            this.$emit("update:data", this.localValue);
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
</style>

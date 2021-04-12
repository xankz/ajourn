<template>
    <div v-if="editView">
        <q-input
            label="Label"
            :modelValue="modelValue.label"
            @update:modelValue="updateLabel"
            style="font-family: monospace"
            outlined
            dense
        >
            <template v-slot:append>
                <q-icon name="help">
                    <q-tooltip>
                        Available variables:<br />
                        %min = Minimum value<br />
                        %max = Maximum value <br />
                        %val = Current value<br />
                        %val2 = Current value (%)<br />
                        %rem = Remaining value<br />
                        %rem2 = Remaining value (%)
                    </q-tooltip>
                    <q-dialog>hi</q-dialog>
                </q-icon>
            </template>
        </q-input>
        <div class="row q-gutter-md q-pt-sm">
            <div class="col-md">
                <q-input
                    outlined
                    dense
                    label="Min"
                    type="number"
                    :modelValue="modelValue.minValue"
                    @update:modelValue="updateMinValue"
                ></q-input>
            </div>
            <div class="col-md">
                <q-input
                    label="Max"
                    type="number"
                    outlined
                    dense
                    :modelValue="modelValue.maxValue"
                    @update:modelValue="updateMaxValue"
                ></q-input>
            </div>
            <div class="col-md">
                <q-input
                    label="Value"
                    type="number"
                    outlined
                    dense
                    :modelValue="modelValue.value"
                    @update:modelValue="updateValue"
                ></q-input>
            </div>
        </div>
        <q-separator class="q-my-md"></q-separator>
        <div class="row">
            <div class="col-md">
                <q-checkbox
                    :modelValue="modelValue.showBar"
                    @update:modelValue="updateShowBar"
                    style="transform: translateX(-10px)"
                    label="Show bar"
                ></q-checkbox>
            </div>
            <div class="col-md">
                <q-select
                    label="Bar type"
                    :disable="!modelValue.showBar"
                    :options="barOptions"
                    :modelValue="modelValue.barType"
                    @update:modelValue="updateBarType"
                    outlined
                    dense
                >
                </q-select>
            </div>
        </div>
        <q-input
            class="q-mt-sm"
            label="Bar color"
            :disable="!modelValue.showBar"
            :modelValue="modelValue.barColor"
            @update:modelValue="updateBarColor"
            outlined
            dense
        >
            <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-color
                            :modelValue="modelValue.barColor"
                            @update:modelValue="updateBarColor"
                        />
                    </q-popup-proxy>
                </q-icon>
            </template>
        </q-input>
    </div>
    <div v-else>
        <div class="text-subtitle2 q-mb-xs">{{ modelValue.name }}</div>
        <template v-if="modelValue.showBar">
            <q-linear-progress
                size="24px"
                rounded
                v-if="modelValue.barType == 'linear'"
                :value="barValue"
                ref="progress"
            >
                <div class="absolute-full flex flex-center">
                    <q-badge
                        color="white"
                        text-color="accent"
                        class="text-weight-bold"
                        :label="progressLabel"
                    />
                </div>
            </q-linear-progress>
            <div v-else style="display: inline-block">
                <q-circular-progress
                    :value="modelValue.value"
                    size="xl"
                    :min="modelValue.minValue"
                    :max="modelValue.maxValue"
                    show-value
                    :style="{ color: modelValue.barColor }"
                    center-color="grey-3"
                    track-color="grey-3"
                >
                </q-circular-progress>
                <q-tooltip>{{ progressLabel }}</q-tooltip>
            </div>
        </template>
        <template v-else>
            <div class="text-weight-bold text-h6">{{ progressLabel }}</div>
        </template>
    </div>
</template>

<script lang="ts">
import { QCircularProgress, QLinearProgress, setCssVar } from "quasar";
import { computed, defineComponent, PropType, ref, watchEffect } from "vue";

import { Entry, Field, FieldType, ProgressField, TextField } from "@/store/types";

export default defineComponent({
    name: "ProgressField",
    emits: ["update:modelValue"],
    props: {
        modelValue: {
            type: Object as PropType<ProgressField>,
            required: true,
        },
        editView: {
            type: Boolean,
            default: false,
        },
        entry: {
            type: Object as PropType<Entry>,
            required: true,
        },
    },
    setup: (props, { emit }) => {
        const progress = ref<QLinearProgress | QCircularProgress | null>(null);
        const updateMinValue = (minValue: string) => {
            const value = Number.parseInt(minValue) || 0;
            emit("update:modelValue", { ...props.modelValue, minValue: value } as ProgressField);
        };
        const updateMaxValue = (maxValue: string) => {
            const value = Number.parseInt(maxValue) || 0;
            emit("update:modelValue", { ...props.modelValue, maxValue: value } as ProgressField);
        };
        const updateValue = (value: string) => {
            const value2 = Number.parseInt(value) || 0;
            emit("update:modelValue", { ...props.modelValue, value: value2 } as ProgressField);
        };
        const updateShowBar = (showBar: boolean) => {
            emit("update:modelValue", { ...props.modelValue, showBar } as ProgressField);
        };
        const updateBarType = (barType: { value: "linear" | "circular" }) => {
            emit("update:modelValue", {
                ...props.modelValue,
                barType: barType.value,
            } as ProgressField);
        };
        const updateBarColor = (barColor: string) => {
            emit("update:modelValue", { ...props.modelValue, barColor } as ProgressField);
        };
        const updateLabel = (label: string) => {
            emit("update:modelValue", { ...props.modelValue, label } as ProgressField);
        };
        const barValue = computed(() => {
            return (
                (props.modelValue as ProgressField).value /
                ((props.modelValue as ProgressField).maxValue -
                    (props.modelValue as ProgressField).minValue)
            );
        });
        const progressLabel = computed(() => {
            let l = props.modelValue.label.replaceAll("%min", String(props.modelValue.minValue));
            l = l.replaceAll("%max", String(props.modelValue.maxValue));
            l = l.replaceAll("%rem2", String(((1 - barValue.value) * 100).toFixed(2)));
            l = l.replaceAll("%rem", String(props.modelValue.maxValue - props.modelValue.value));
            l = l.replaceAll("%val2", String((barValue.value * 100).toFixed(2)));
            l = l.replaceAll("%val", String(props.modelValue.value));
            return l;
        });
        watchEffect(() => {
            if (progress.value) {
                setCssVar(
                    "primary",
                    (props.modelValue as ProgressField).barColor,
                    progress.value.$el
                );
            }
        });
        const barOptions = [
            {
                label: "Linear",
                value: "linear",
            },
            {
                label: "Circular",
                value: "circular",
            },
        ];

        return {
            FieldType,
            updateLabel,
            updateMinValue,
            updateMaxValue,
            updateValue,
            updateShowBar,
            updateBarType,
            updateBarColor,
            barOptions,
            barValue,
            progress,
            progressLabel,
        };
    },
});
</script>

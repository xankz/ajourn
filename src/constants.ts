import AttachmentsFieldV from "@/components/fields/AttachmentsField.vue";
import DescriptionFieldV from "@/components/fields/DescriptionField.vue";
import EmbedFieldV from "@/components/fields/EmbedField.vue";
import MapFieldV from "@/components/fields/MapField.vue";
import NumberFieldV from "@/components/fields/NumberField.vue";
import ProgressFieldV from "@/components/fields/ProgressField.vue";
import ReferenceFieldV from "@/components/fields/ReferenceField.vue";
import TextFieldV from "@/components/fields/TextField.vue";
import ToggleFieldV from "@/components/fields/ToggleField.vue";

import {
    AttachmentsField,
    DescriptionField,
    EmbedField,
    FieldType,
    MapField,
    NumberField,
    ProgressField,
    ReferenceField,
    TextField,
    ToggleField,
} from "./store/types";

export const AttachmentNameLength = 64;

export const DefaultTextField: Omit<TextField, "type" | "id"> = {
    name: "New Text",
    content: "",
};

export const DefaultDescriptionField: Omit<DescriptionField, "type" | "id"> = {
    name: "New Description",
    content: "",
};

export const DefaultNumberField: Omit<NumberField, "type" | "id"> = {
    name: "New Number",
    value: 0,
};

export const DefaultToggleField: Omit<ToggleField, "type" | "id"> = {
    name: "New Toggle",
    value: true,
    whenTrue: "On",
    whenFalse: "Off",
};

export const DefaultProgressField: Omit<ProgressField, "type" | "id"> = {
    name: "New Progress",
    maxValue: 100,
    minValue: 0,
    value: 100,
    showBar: true,
    barType: "linear",
    barColor: "#007bf5",
    label: "%val / %max",
};

export const DefaultAttachmentsField: Omit<AttachmentsField, "type" | "id"> = {
    name: "New Attachments",
    attachments: [],
};

export const DefaultEmbedField: Omit<EmbedField, "type" | "id"> = {
    name: "New Embed",
    url: "",
};

export const DefaultMapField: Omit<MapField, "type" | "id"> = {
    name: "New Map",
    imageKey: undefined,
    locations: [],
};

export const DefaultReferenceField: Omit<ReferenceField, "type" | "id"> = {
    name: "New Reference",
    categories: [],
    entries: [],
};

export const FieldDefs = {
    [FieldType.Text]: {
        component: TextFieldV,
        default: DefaultTextField,
        label: "Text",
        icon: "short_text",
    },
    [FieldType.Description]: {
        component: DescriptionFieldV,
        default: DefaultDescriptionField,
        label: "Description",
        icon: "subject",
    },
    [FieldType.Number]: {
        component: NumberFieldV,
        default: DefaultNumberField,
        label: "Number",
        icon: "pin",
    },
    [FieldType.Toggle]: {
        component: ToggleFieldV,
        default: DefaultToggleField,
        label: "Toggle",
        icon: "toggle_on",
    },
    [FieldType.Progress]: {
        component: ProgressFieldV,
        default: DefaultProgressField,
        label: "Progress",
        icon: "horizontal_rule",
    },
    [FieldType.Attachments]: {
        component: AttachmentsFieldV,
        default: DefaultAttachmentsField,
        label: "Attachments",
        icon: "perm_media",
    },
    [FieldType.Map]: {
        component: MapFieldV,
        default: DefaultMapField,
        label: "Map",
        icon: "map",
    },
    [FieldType.Reference]: {
        component: ReferenceFieldV,
        default: DefaultReferenceField,
        label: "Reference",
        icon: "file_present",
    },
    [FieldType.Embed]: {
        component: EmbedFieldV,
        default: DefaultEmbedField,
        label: "Embed",
        icon: "link",
    },
};

export const CreateFieldTree = [
    {
        label: "General",
        icon: "folder",
        selectable: false,
        fieldType: "_",
        children: Object.entries(FieldDefs).map((k) => ({
            fieldType: k[0],
            label: k[1].label,
            icon: k[1].icon,
        })),
    },
];

//             { fieldType: FieldType.Reference, label: "Reference", icon: "file_present" },

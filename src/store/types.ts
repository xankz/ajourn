export const API_FETCH_JOURNALS = "API_FETCH_JOURNALS";
export const API_CREATE_JOURNAL = "API_CREATE_JOURNAL";
export const API_OPEN_JOURNAL = "API_OPEN_JOURNAL";
export const API_FETCH_JOURNAL = "API_FETCH_JOURNAL";
export const API_CLOSE_JOURNAL = "API_CLOSE_JOURNAL";
export const API_CREATE_ENTRY = "API_CREATE_ENTRY";
export const API_FETCH_ENTRIES = "API_FETCH_ENTRIES";
export const API_FETCH_ENTRY = "API_FETCH_ENTRY";
export const API_UPDATE_ENTRY = "API_UPDATE_ENTRY";
export const API_DELETE_ENTRY = "API_DELETE_ENTRY";
export const API_ADD_ENTRY_ATTACHMENT = "API_ADD_ENTRY_ATTACHMENT";
export const API_DELETE_ENTRY_ATTACHMENT = "API_DELETE_ENTRY_ATTACHMENT";
export const API_SET_LAST_ENTRY = "API_SET_LAST_ENTRY";
export const API_UPDATE_JOURNAL = "API_UPDATE_JOURNAL";

export const SET_JOURNAL = "SET_JOURNAL";
export const SET_JOURNALS = "SET_JOURNALS";
export const SET_ENTRIES = "SET_ENTRIES";
export const SET_ENTRY = "SET_ENTRY";
export const UI_VISIBILITY = "UI_VISIBILITY";
export const SET_CURRENT_JOURNAL = "SET_CURRENT_JOURNAL";
export const SET_DB = "SET_DB";
export const SET_LAST_ENTRY = "SET_LAST_ENTRY";
export const SET_USER_PREFS = "SET_USER_PREFS";

export const indexDocumentKey = "0";

export enum FieldType {
    Text = 0,
    Description = 1,
    Number = 2,
    Toggle = 3,
    Progress = 4,
    Attachments = 5,
    Map = 6,
    Reference = 7,
    Embed = 8,
}

export type UserPrefs = {
    darkMode: boolean;
    lastEntry: string;
};

export type Journal = {
    id: string;
    title: string;
};

export enum DocumentType {
    Entry = "entry",
    Category = "category",
}

export type JournalIndex = {
    title: string;
    description: string;
    categories: Category[];
};

export type FetchEntriesOpts = {
    save: boolean;
    category: string;
    flush: boolean;
};

export type Category = {
    name: string;
    color: string;
    labelSingular: string;
    labelPlural: string;
    id: string;
};

export type Entry = {
    type: DocumentType.Entry;
    title: string;
    avatar: EntryAvatar;
    category: string[];
    fields: Field[];
    id: string;
    readonly attachments: { [key: string]: PouchDB.Core.FullAttachment };
};

export type BaseField = {
    name: string;
    id: string;
};

export type Field =
    | TextField
    | DescriptionField
    | NumberField
    | ToggleField
    | ProgressField
    | AttachmentsField
    | EmbedField
    | MapField
    | ReferenceField;

export type TextField = BaseField & {
    type: FieldType.Text;
    content: string;
};

export type DescriptionField = BaseField & {
    type: FieldType.Description;
    content: string;
};

export type NumberField = BaseField & {
    type: FieldType.Number;
    value: number;
};

export type ToggleField = BaseField & {
    type: FieldType.Toggle;
    value: boolean;
    whenTrue: string;
    whenFalse: string;
};

export type ProgressField = BaseField & {
    type: FieldType.Progress;
    minValue: number;
    value: number;
    maxValue: number;
    showBar: boolean;
    barType: "linear" | "circular";
    barColor: string;
    label: string;
};

export type AttachmentsField = BaseField & {
    type: FieldType.Attachments;
    attachments: string[];
};

export type CreateAttachment = {
    name: string;
    data: File | string;
};

export enum EmbedFieldService {
    Invalid = -1,
    Unknown = 0,
    YouTube = 1,
    Spotify = 2,
    Soundcloud = 3,
}

export type EmbedField = BaseField & {
    type: FieldType.Embed;
    url: string;
};

export type MapField = BaseField & {
    type: FieldType.Map;
    customName?: string;
    imageKey?: string;
    locations: MapFieldLocation[];
};

export type MapFieldLocation = {
    entryId: string;
    position: [number, number];
};

export type ReferenceField = BaseField & {
    type: FieldType.Reference;
    entries: string[];
    categories: string[];
};

export type EntryAvatar = {
    type: "icon" | "attachment";
    data: string | ArrayBuffer;
};

export type CurrentJournal = {
    index: JournalIndex;
    categories: string[];
    entries: Entry[];
};

export type CreateJournal = Pick<Journal, "title">;

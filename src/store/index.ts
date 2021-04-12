// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Cookies from "js-cookie";
import * as mime from "mime-types";
import shortid from "short-uuid";
import { InjectionKey, unref } from "vue";
import { createLogger, createStore, Plugin, Store, useStore as baseUseStore } from "vuex";

import { openLocal, PouchDB, useDB } from "@/db";
import { b64 } from "@/utils";

import {
    API_ADD_ENTRY_ATTACHMENT,
    API_CLOSE_JOURNAL,
    API_CREATE_ENTRY,
    API_CREATE_JOURNAL,
    API_DELETE_ENTRY,
    API_DELETE_ENTRY_ATTACHMENT,
    API_FETCH_ENTRIES,
    API_FETCH_ENTRY,
    API_FETCH_JOURNAL,
    API_FETCH_JOURNALS,
    API_OPEN_JOURNAL,
    API_SET_LAST_ENTRY,
    API_UPDATE_ENTRY,
    API_UPDATE_JOURNAL,
    CreateAttachment,
    CreateJournal,
    DocumentType,
    Entry,
    FetchEntriesOpts,
    indexDocumentKey,
    JournalIndex,
    SET_CURRENT_JOURNAL,
    SET_ENTRIES,
    SET_ENTRY,
    SET_JOURNAL,
    SET_JOURNALS,
    SET_LAST_ENTRY,
    UI_VISIBILITY,
} from "./types";

export interface State {
    fetchingJournals: boolean;
    fetchingJournalsOpen?: string;
    fetchingEntries: boolean;
    currentJournal?: string;
    entries: { [key: string]: Entry };
    journals: { [key: string]: JournalIndex };
    lastEntry: string;
    showUi: boolean;
}

export const key: InjectionKey<Store<State>> = Symbol();

const dbIndexes = [["title"], ["type"], ["category"]];

export function useStore() {
    return baseUseStore(key);
}

export const store = createStore<State>({
    state: {
        fetchingJournals: false,
        fetchingEntries: false,
        currentJournal: undefined,
        showUi: false,
        entries: {},
        lastEntry: "",
        journals: {},
    },
    mutations: {
        [SET_LAST_ENTRY](state, payload: string) {
            state.lastEntry = payload;
        },
        [SET_JOURNALS](state, payload: { [key: string]: JournalIndex }) {
            state.journals = payload;
        },
        [SET_JOURNAL](state, payload: { id: string; journal: JournalIndex }) {
            state.journals[payload.id] = payload.journal;
        },
        [UI_VISIBILITY](state, payload: boolean) {
            state.showUi = payload;
        },
        [SET_CURRENT_JOURNAL](state, payload?: string) {
            state.currentJournal = payload;
        },
        [SET_ENTRIES](state, payload: { [key: string]: Entry }) {
            if (state.currentJournal) {
                state.entries = payload;
            }
        },
        [SET_ENTRY](state, payload: { id: string; entry: Entry }) {
            state.entries[payload.id] = payload.entry;
        },
    },
    getters: {
        currentJournal(state) {
            return state.currentJournal ? state.journals[state.currentJournal] : undefined;
        },
        entryAttachment: (state) => (id: string, name: string) => {
            if (id in state.entries) {
                if (name in state.entries[id].attachments) {
                    return b64(
                        state.entries[id].attachments[name].content_type,
                        state.entries[id].attachments[name].data as string
                    );
                }
            }
            return undefined;
        },
        entryAttachmentFull: (state) => (id: string, name: string) => {
            if (id in state.entries) {
                if (name in state.entries[id].attachments) {
                    return state.entries[id].attachments[name];
                }
            }
            return undefined;
        },
    },
    actions: {
        async [API_SET_LAST_ENTRY]({ commit }, payload: string) {
            Cookies.set("lastEntry", payload);
            commit(SET_LAST_ENTRY, payload);
        },
        async [API_DELETE_ENTRY_ATTACHMENT](
            { state, dispatch },
            payload: { id: string; name: string }
        ) {
            if (!this.state.currentJournal) {
                throw new Error("Journal not opened");
            }

            // Delete attachment from database
            try {
                const db = useDB(`aj_${state.currentJournal}`);
                const e = await db.get<Entry>(payload.id);
                await db.removeAttachment(payload.id, payload.name, e._rev);
                await db.close();
                await dispatch(API_FETCH_ENTRY, { id: payload.id, force: true });
            } catch (e) {
                throw new Error(e.message);
            }
        },
        async [API_ADD_ENTRY_ATTACHMENT](
            { state, dispatch },
            payload: { id: string; attachment: CreateAttachment }
        ) {
            if (!this.state.currentJournal) {
                throw new Error("Journal not opened");
            }

            // Add attachment to database
            try {
                const db = useDB(`aj_${state.currentJournal}`);
                const e = await db.get<Entry>(payload.id);

                // Determine attachment content-type
                let contentType = "text/plain";
                if (payload.attachment.data instanceof File) {
                    const mType = mime.extension(payload.attachment.data.name) || "text/plain";
                    contentType = payload.attachment.data.type || mType;
                }

                // Save attachment
                await db.putAttachment(
                    payload.id,
                    payload.attachment.name,
                    e._rev,
                    new Blob([payload.attachment.data], { type: contentType }),
                    contentType
                );
                await db.close();
                await dispatch(API_FETCH_ENTRY, { id: payload.id, force: true });
            } catch (e) {
                throw new Error(e.message);
            }
        },
        async [API_DELETE_ENTRY]({ state, dispatch }, payload: string) {
            if (!this.state.currentJournal) {
                throw new Error("Journal not opened");
            }

            // Delete database entry
            try {
                const db = useDB(`aj_${state.currentJournal}`);
                const e = await db.get<Entry>(payload);
                await db.remove(e._id, e._rev);
                await db.close();
            } catch (e) {
                throw new Error(e.message);
            }

            await dispatch(API_FETCH_ENTRIES);
        },
        async [API_UPDATE_ENTRY]({ state, dispatch }, payload: { id: string; data: Entry }) {
            if (!this.state.currentJournal) {
                throw new Error("Journal not opened.");
            }

            // Update database entry
            try {
                const db = useDB(`aj_${state.currentJournal}`);
                let e = await db.get<Entry>(payload.id);
                e = { ...e, ...payload.data };

                // Ensure attachments map isn't included in update
                if (Object.prototype.hasOwnProperty.call(e, "attachments")) {
                    delete (e as any)["attachments"];
                }

                await db.put(e);
                await db.close();
            } catch (e) {
                throw new Error(e.message);
            }

            await dispatch(API_FETCH_ENTRIES);
        },
        async [API_FETCH_JOURNALS]({ commit, state, dispatch }) {
            state.fetchingJournals = true;

            // Fetch and filter all databases native to ajourn
            const all = (await PouchDB.allDbs()).filter((j) => j.startsWith("aj_"));

            // Fetch index document from each database to aggregate
            const inds: { [key: string]: JournalIndex } = {};
            for (let i = 0; i < all.length; i++) {
                const db = useDB(all[i]);
                try {
                    const ind = await db.get<JournalIndex>(indexDocumentKey);
                    const key = all[i].replace("aj_", "");
                    inds[key] = ind;
                } catch (e) {
                    continue;
                } finally {
                    await db.close();
                    state.fetchingJournals = false;
                }
            }

            // Update journals in local state
            commit(SET_JOURNALS, inds);

            // Open journal if cached
            if (state.fetchingJournalsOpen) {
                await dispatch(API_OPEN_JOURNAL, state.fetchingJournalsOpen);
                state.fetchingJournalsOpen = "";
            }
        },
        async [API_FETCH_JOURNAL]({ state, commit }, payload: string) {
            // Check if journal exists in local state
            if (state.journals[payload]) {
                return state.journals[payload];
            }

            const db = new PouchDB(payload, { skip_setup: true });
            // Load journal from database
            try {
                const i = await db.get<JournalIndex>(indexDocumentKey);

                // Add journal to local state
                // state.journals[payload] = i;
                commit(SET_JOURNAL, { id: payload, journal: i });

                return i;
            } catch (e) {
                throw new Error("Journal does not exist");
            } finally {
                await db.close();
            }
        },
        async [API_CLOSE_JOURNAL]({ state, commit }) {
            commit(SET_CURRENT_JOURNAL, "");
            commit(SET_ENTRIES, {});
        },
        async [API_UPDATE_JOURNAL]({ state, commit }, payload: Partial<JournalIndex>) {
            if (!state.currentJournal) {
                throw new Error("Journal not opened.");
            }
            const db = useDB(`aj_${state.currentJournal}`);
            try {
                let j = await db.get<JournalIndex>(indexDocumentKey);
                j = { ...j, ...payload };

                await db.put(j);
                commit(SET_JOURNAL, { id: state.currentJournal, journal: j });
            } catch (e) {
                throw new Error(e.message);
            } finally {
                await db.close();
            }
        },
        async [API_OPEN_JOURNAL]({ dispatch, commit, state }, payload: string) {
            if (state.fetchingJournals) {
                state.fetchingJournalsOpen = payload;
                return;
            }

            // Test open journal database - create database indexes
            const db = useDB(`aj_${payload}`);
            try {
                for (let i = 0; i < dbIndexes.length; i++) {
                    await db.createIndex({ index: { fields: dbIndexes[i] } });
                }
            } catch (e) {
                throw new Error(e.message);
            } finally {
                await db.close();
            }

            // Set current journal
            commit(SET_CURRENT_JOURNAL, payload);

            // Load top-level state collections
            await dispatch(API_FETCH_ENTRIES);
        },
        async [API_CREATE_ENTRY]({ state, dispatch }, payload: Entry) {
            if (!state.currentJournal) {
                throw new Error("Journal not opened.");
            }

            // Create entry
            const db = useDB(`aj_${state.currentJournal}`);
            const id = shortid.generate();
            await db.put<Entry>({
                _id: id,
                ...payload,
                type: DocumentType.Entry,
                fields: [],
            });
            await db.close();
            await dispatch(API_FETCH_ENTRIES);
            return await dispatch(API_FETCH_ENTRY, { id });
        },
        async [API_FETCH_ENTRY](
            { state, dispatch, commit },
            payload: { id: string; force: boolean }
        ) {
            if (!state.currentJournal && !state.fetchingEntries) {
                throw new Error("Journal not opened.");
            }

            // Check if entry exists in local state
            if (
                state.entries[payload.id] &&
                Object.prototype.hasOwnProperty.call(state.entries[payload.id], "attachments") &&
                !payload.force
            ) {
                return state.entries[payload.id];
            }

            // Load journal from database
            const db = useDB(`aj_${state.currentJournal}`);
            try {
                let e = await db.get<Entry>(payload.id, { attachments: true });
                e = {
                    ...e,
                    attachments: e._attachments
                        ? (e._attachments as {
                              [key: string]: PouchDB.Core.FullAttachment;
                          })
                        : {},
                    id: e._id,
                };
                if (e._attachments) {
                    delete e._attachments;
                }
                commit(SET_ENTRY, { id: e._id, entry: e });
                return e;
            } catch (e) {
                throw new Error("Entry does not exist.");
            } finally {
                await db.close();
            }
        },
        async [API_FETCH_ENTRIES](
            { state, commit },
            payload: FetchEntriesOpts = { save: true, category: "", flush: true }
        ) {
            if (!state.currentJournal) {
                throw new Error("Journal not opened.");
            }
            const db = useDB(`aj_${state.currentJournal}`);
            state.fetchingEntries = true;
            let data;
            try {
                data = await db.find({
                    selector: {
                        type: DocumentType.Entry,
                        category: payload.category
                            ? { $elemMatch: { $eq: payload.category } }
                            : undefined,
                    },
                    fields: [
                        "_id",
                        "title",
                        "avatar",
                        "category",
                        "type",
                        "fields",
                        "_attachments",
                    ],
                });
                // Map attachments to all entries
                let data2 = data.docs.map((d: any) => {
                    return {
                        id: d._id,
                        title: d.title,
                        avatar: d.avatar,
                        category: d.category,
                        type: d.type,
                        fields: d.fields,
                        attachments: d._attachments ? d._attachments : {},
                    };
                });
                if (payload.save) {
                    data2 = payload.flush ? data2 : { ...state.entries, ...data2 };
                    commit(
                        SET_ENTRIES,
                        data2.reduce((acc, e) => ({ [e.id]: e, ...acc }), {})
                    );
                }
                return data2;
            } catch (e) {
                throw new Error(e.message);
            } finally {
                await db.close();
                state.fetchingEntries = false;
            }
        },
        async [API_CREATE_JOURNAL]({ state }, payload: CreateJournal) {
            const id = shortid.generate();
            const db = useDB(`aj_${id}`, false);
            await db.put({
                _id: indexDocumentKey,
                title: payload.title,
                description: `${payload.title}... What a strange place.`,
                categories: [],
            } as JournalIndex);
            await db.close();
            await this.dispatch(API_FETCH_JOURNALS);
            return id;
        },
    },
    modules: {},
    plugins: [createLogger()],
});

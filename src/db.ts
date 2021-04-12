import PouchDB from "pouchdb";
import allDbs from "pouchdb-all-dbs";
import PouchDBFind from "pouchdb-find";

allDbs(PouchDB);
PouchDB.plugin(PouchDBFind);

export function openLocal(name: string) {
    return new PouchDB(name);
}

export function useDB(name: string, mustExist = true) {
    if (mustExist) {
        try {
            const db = new PouchDB(name, { skip_setup: true });
            return db;
        } catch (e) {
            console.log(e);
            throw new Error("Database does not exist");
        }
    } else {
        return new PouchDB(name);
    }
}

export { PouchDB };

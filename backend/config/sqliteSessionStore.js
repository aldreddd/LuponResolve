
const session = require("express-session");
const db = require("./database");

class SQLiteSessionStore extends session.Store {
    constructor() {
        super();

        this.ready = false;
        this.initError = null;
        this.pending = [];

        // Create the sessions table inside the EXISTING database.
        db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                sid TEXT PRIMARY KEY,
                expires INTEGER NOT NULL,
                data TEXT NOT NULL
            )
        `, (error) => {
            this.ready = true;
            this.initError = error;

            if (error) {
                console.error("Session table creation failed:", error.message);
            } else {
                console.log("SQLite session store is ready!");
            }

            const waiting = this.pending.splice(0);

            waiting.forEach(callback => {
                callback(error);
            });
        });
    }

    // Wait until the sessions table has been created.
    waitUntilReady(callback) {
        if (this.ready) {
            callback(this.initError);
        } else {
            this.pending.push(callback);
        }
    }

    // Retrieve a session.
    get(sid, callback) {
        this.waitUntilReady((error) => {
            if (error) return callback(error);

            db.get(
                "SELECT expires, data FROM sessions WHERE sid = ?",
                [sid],
                (error, row) => {
                    if (error) return callback(error);

                    if (!row) return callback(null, null);

                    // Reject expired sessions.
                    if (row.expires <= Date.now()) {
                        db.run(
                            "DELETE FROM sessions WHERE sid = ?",
                            [sid]
                        );

                        return callback(null, null);
                    }

                    try {
                        callback(null, JSON.parse(row.data));
                    } catch (parseError) {
                        callback(parseError);
                    }
                }
            );
        });
    }

    // Save or update a session.
    
    // Save or update a session.
    set(sid, sessionData, callback) {
        this.waitUntilReady((error) => {
            if (error) {
                if (callback) callback(error);
                return;
            }

            const expires = sessionData.cookie?.expires
                ? new Date(sessionData.cookie.expires).getTime()
                : Date.now() + (sessionData.cookie?.maxAge || 7200000);

            const data = JSON.stringify(sessionData);

            db.run(
                `INSERT OR REPLACE INTO sessions (sid, expires, data)
                 VALUES (?, ?, ?)`,
                [sid, expires, data],
                (saveError) => {
                    if (saveError) {
                        if (callback) callback(saveError);
                        return;
                    }

                    db.run(
                        "DELETE FROM sessions WHERE expires <= ?",
                        [Date.now()],
                        (cleanupError) => {
                            if (callback) {
                                callback(cleanupError || null);
                            }
                        }
                    );
                }
            );
        });
    }


    // Delete a session, such as during logout.
    destroy(sid, callback) {
        this.waitUntilReady((error) => {
            if (error) {
                if (callback) callback(error);
                return;
            }

            db.run(
                "DELETE FROM sessions WHERE sid = ?",
                [sid],
                callback || (() => {})
            );
        });
    }

    
    // Extend an existing session or create it if it does not exist.
    touch(sid, sessionData, callback) {
        this.waitUntilReady((error) => {
            if (error) {
                if (callback) callback(error);
                return;
            }

            const expires = sessionData.cookie?.expires
                ? new Date(sessionData.cookie.expires).getTime()
                : Date.now() + (sessionData.cookie?.maxAge || 7200000);

            const data = JSON.stringify(sessionData);

            db.run(
                `INSERT OR REPLACE INTO sessions (sid, expires, data)
                 VALUES (?, ?, ?)`,
                [sid, expires, data],
                (saveError) => {
                    if (callback) {
                        callback(saveError || null);
                    }
                }
            );
        });
    }

}

module.exports = SQLiteSessionStore;

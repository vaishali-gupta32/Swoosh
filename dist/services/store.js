"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStore = void 0;
class InMemoryStore {
    static reset() {
        this.urls.clear();
        this.shortCodes.clear();
        this.analytics = [];
        this.rateLimits.clear();
        this.idCounter = 1;
        this.stream = [];
    }
}
exports.InMemoryStore = InMemoryStore;
InMemoryStore.urls = new Map();
InMemoryStore.shortCodes = new Map(); // short -> long
InMemoryStore.analytics = [];
InMemoryStore.rateLimits = new Map();
InMemoryStore.idCounter = 1000;
// Auth Store
InMemoryStore.users = new Map();
InMemoryStore.userByUsername = new Map();
InMemoryStore.userIdCounter = 1;
InMemoryStore.stream = [];

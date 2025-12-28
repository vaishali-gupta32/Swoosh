export class InMemoryStore {
    static urls = new Map<number, any>();
    static shortCodes = new Map<string, string>(); // short -> long
    static analytics: any[] = [];
    static rateLimits = new Map<string, number>();
    static idCounter = 1000;

    // Auth Store
    static users = new Map<number, any>();
    static userByUsername = new Map<string, any>();
    static userIdCounter = 1;
    static stream: any[] = [];

    static reset() {
        this.urls.clear();
        this.shortCodes.clear();
        this.analytics = [];
        this.rateLimits.clear();
        this.idCounter = 1;
        this.stream = [];
    }
}

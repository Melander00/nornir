"server-only"

type CacheOptions = {
    ttl?: number
}

export class SimpleCache {

    private ttl;

    private data = new Map()
    private timers = new Map()

    constructor(options?: CacheOptions) {
        this.ttl = options?.ttl ?? 60;
    }


    set<T>(key: string, value: T, ttl?: number) {
        if( this.timers.has(key) ) {
            clearTimeout(this.timers.get(key))
        }

        this.timers.set(key, setTimeout(() => this.delete(key), (ttl ?? this.ttl) * 1000))
        this.data.set(key, value)
    }

    get<T>(key: string): T {
        return this.data.get(key)
    }

    has(key: string) {
        return this.data.has(key)
    }

    delete(key: string) {
        if( this.timers.has(key) ) {
            clearTimeout(this.timers.get(key))
            this.timers.delete(key)
        }

        return this.data.delete(key)
    }

    clear() {
        this.data.clear()
        for(const v of this.timers.values()) {
            clearTimeout(v)
        }
        this.timers.clear()
    }

}
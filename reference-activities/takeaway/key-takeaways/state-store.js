(function (root) {
    function topStore() {
        try {
            const host = root.top || root.parent || root;
            host.__driverSafetyState ||= {};
            return host.__driverSafetyState;
        } catch (error) { return null; }
    }

    function topLevelRefresh() {
        if (root.top !== root) return false;
        try {
            const navigation = performance.getEntriesByType('navigation')[0];
            return navigation?.type === 'reload';
        } catch (error) { return false; }
    }

    function create(key) {
        const store = topStore();
        let fallback = null;
        try { fallback = root.sessionStorage; } catch (error) { /* unavailable */ }
        if (topLevelRefresh()) { if (store) delete store[key]; try { fallback?.removeItem(key); } catch (error) { /* unavailable */ } }
        return {
            read() {
                if (store && store[key] !== undefined) return store[key];
                try { const saved = fallback?.getItem(key); return saved ? JSON.parse(saved) : null; } catch (error) { return null; }
            },
            write(value) {
                if (store) store[key] = value;
                else try { fallback?.setItem(key, JSON.stringify(value)); } catch (error) { /* unavailable */ }
            },
            clear() {
                if (store) delete store[key];
                try { fallback?.removeItem(key); } catch (error) { /* unavailable */ }
            }
        };
    }

    root.DriverSafetyState = { create, topLevelRefresh };
})(typeof window !== 'undefined' ? window : globalThis);

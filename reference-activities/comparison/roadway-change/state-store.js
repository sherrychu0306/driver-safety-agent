(function (root) {
    function topStore() { try { const host = root.top || root.parent || root; host.__driverSafetyState ||= {}; return host.__driverSafetyState; } catch (error) { return null; } }
    function topLevelRefresh() { if (root.top !== root) return false; try { return performance.getEntriesByType('navigation')[0]?.type === 'reload'; } catch (error) { return false; } }
    function create(key) { const store = topStore(); let fallback = null; try { fallback = root.sessionStorage; } catch (error) {} if (topLevelRefresh()) { if (store) delete store[key]; try { fallback?.removeItem(key); } catch (error) {} } return { read: () => { if (store?.[key] !== undefined) return store[key]; try { const saved = fallback?.getItem(key); return saved ? JSON.parse(saved) : null; } catch (error) { return null; } }, write: value => { if (store) store[key] = value; else try { fallback?.setItem(key, JSON.stringify(value)); } catch (error) {} }, clear: () => { if (store) delete store[key]; try { fallback?.removeItem(key); } catch (error) {} } }; }
    root.DriverSafetyState = { create, topLevelRefresh };
})(typeof window !== 'undefined' ? window : globalThis);

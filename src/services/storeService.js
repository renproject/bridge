let store = {}

export const getStore = function() {
    return store
}

export const storeListener = function(newStore) {
    store = newStore
}

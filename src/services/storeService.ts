let store = new Map();

export const getStore = function () {
  return store;
};

export const storeListener = function (newStore: any) {
  store = newStore;
};

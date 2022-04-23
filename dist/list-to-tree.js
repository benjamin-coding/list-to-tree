const IronTree = require('@denq/iron-tree');

const defaultOptions = {
    root_val: '__TOP__',
    key_sort: 'sort',
    key_id: 'id',
    key_parent: 'parent',
    key_child: 'child',
    empty_children: false,
};

const depthKeyName = '__depth'

function compare(a, b) {
    return a === b ? 0 : (a > b ? 1 : -1)
}

function sortBy(collection, depthKeyName, pKeyName, idKeyName, sortKeyName) {
    return collection.sort(function (a, b) {
        return compare(a[depthKeyName], b[depthKeyName])
            || compare(a[sortKeyName], b[sortKeyName])
            || compare(a[pKeyName], b[pKeyName])
            || compare(a[idKeyName], b[idKeyName])
    });
};

function writeDepth(parentKeyName, keyName, remainingList, currentDepth = 0, parentIds = [0]) {
    if (remainingList.length === 0) return;
    const nextParentIds = []
    const nextRemainingList = []
    remainingList.forEach((item) => {
        if (parentIds.includes(item[parentKeyName])) {
            item[depthKeyName] = currentDepth
            nextParentIds.push(item[keyName])
        } else {
            nextRemainingList.push(item)
        }
    })
    // if invalid list exists, the process is over
    if (remainingList.length === nextRemainingList.length) return;
    writeDepth(parentKeyName, keyName, nextRemainingList, currentDepth + 1, nextParentIds)
};

module.exports = class LTT {

    constructor(list, options = {}) {
        const _list = list.map((item) => item);

        options = Object.assign({}, defaultOptions, options);
        this.options = options;
        const {root_val, key_sort, key_id, key_parent} = options;

        writeDepth(key_parent, key_id, _list)
        sortBy(_list, depthKeyName, key_parent, key_id, key_sort);

        const tree = new IronTree({[key_id]: root_val});
        _list.forEach((item, index) => {
            tree.add((parentNode) => {
                return parentNode.get(key_id) === item[key_parent];
            }, item);
        });

        this.tree = tree;
    }

    sort(criteria) {
        this.tree.sort(criteria);
    }

    GetTree() {
        const {key_child, empty_children} = this.options;
        return this.tree.toJson({
            key_children: key_child,
            empty_children
        })[key_child];
    }

}

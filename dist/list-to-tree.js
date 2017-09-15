const IronTree = require('@denq/iron-tree');

const defaultOptions = {
  key_id: 'id' ,
  key_parent: 'parent' ,
  key_child: 'child',
  empty_children: false,
};

function sortBy(collection, propertyA, propertyB) {
  return collection.sort(function(a, b) {
    if (a[propertyB] < b[propertyB]) {
      if (a[propertyA] > b[propertyA]) {
        return 1;
      }
      return -1;
    } else {
      if (a[propertyA] < b[propertyA]) {
        return -1;
      }
      return 1;
    }
  });
};

function compareById(vector) {
  return (a, b) => {
    const aid = Number(a.parent);
    const bid = Number(b.parent);
    if (aid > bid) {
      return vector ? 1 : -1;
    } else if (aid < bid) {
      return vector ? -1 : 1;
    } else {
      return 0
    }
  };
}

module.exports = class LTT{

  constructor(list, options = {}) {
    const _list = list.map((item) => item);

    options = Object.assign({}, defaultOptions, options);
    this.options = options;
    const { key_id, key_parent } = options;

    sortBy(_list, key_parent, key_id);
    const tree = new IronTree({ [key_id]: 0 });
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

  split(list) {
    list.sort(compareById(true));
    const rootParentId = list[0].parent;

    const collection = [];
    list.forEach((item) => {
      if (item.parent === rootParentId) {
        collection.push([item]);
      } else {
        collection.forEach((el) => {
          el.forEach((child) => {
            if (child.id === item.parent) {
              el.push(item);
            }
          });
        });

      }
    });
    return collection;
  }

  GetTree() {
    const { key_child, empty_children } = this.options;
    return this.tree.toJson({
      key_children: key_child,
      empty_children: false,
    })[key_child];
  }

}

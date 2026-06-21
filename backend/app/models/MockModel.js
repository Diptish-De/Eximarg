import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');

let isFileSystemWritable = true;
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  isFileSystemWritable = false;
}

export class MockModel {
  _attachSave(item) {
    if (!item) return null;
    if (Object.prototype.hasOwnProperty.call(item, 'save')) return item;
    
    const self = this;
    Object.defineProperty(item, 'save', {
      value: async function() {
        const list = self._read();
        const idx = list.findIndex(x => x._id === this._id);
        if (idx !== -1) {
          const cleanItem = { ...this };
          delete cleanItem.save;
          list[idx] = cleanItem;
          self._write(list);
        }
        return this;
      },
      writable: true,
      configurable: true,
      enumerable: false
    });
    return item;
  }

  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    
    if (isFileSystemWritable) {
      try {
        if (!fs.existsSync(this.filePath)) {
          fs.writeFileSync(this.filePath, JSON.stringify([]));
        }
      } catch (e) {
        isFileSystemWritable = false;
      }
    }
    
    if (!isFileSystemWritable) {
      global._mockDb = global._mockDb || {};
      global._mockDb[this.collectionName] = global._mockDb[this.collectionName] || [];
    }
  }

  _read() {
    if (!isFileSystemWritable) {
      return global._mockDb[this.collectionName] || [];
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      isFileSystemWritable = false;
      global._mockDb = global._mockDb || {};
      global._mockDb[this.collectionName] = global._mockDb[this.collectionName] || [];
      return global._mockDb[this.collectionName];
    }
  }

  _write(data) {
    if (!isFileSystemWritable) {
      global._mockDb[this.collectionName] = data;
      return;
    }
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      isFileSystemWritable = false;
      global._mockDb = global._mockDb || {};
      global._mockDb[this.collectionName] = data;
    }
  }

  async find(query = {}) {
    const list = this._read();
    const filtered = list.filter(item => {
      for (const key in query) {
        let qVal = query[key];
        let itemVal = item[key];
        if (qVal && typeof qVal === 'object' && qVal.toString) qVal = qVal.toString();
        if (itemVal && typeof itemVal === 'object' && itemVal.toString) itemVal = itemVal.toString();
        if (itemVal !== qVal) return false;
      }
      return true;
    });
    return filtered.map(item => {
      item._collectionFilePath = this.filePath;
      return this._attachSave(item);
    });
  }

  async findOne(query = {}) {
    const list = this._read();
    const item = list.find(item => {
      for (const key in query) {
        let qVal = query[key];
        let itemVal = item[key];
        if (qVal && typeof qVal === 'object' && qVal.toString) qVal = qVal.toString();
        if (itemVal && typeof itemVal === 'object' && itemVal.toString) itemVal = itemVal.toString();
        if (itemVal !== qVal) return false;
      }
      return true;
    });
    if (!item) return null;
    item._collectionFilePath = this.filePath;
    return this._attachSave(item);
  }

  async findById(id) {
    const list = this._read();
    const idStr = id ? id.toString() : '';
    const item = list.find(item => item._id === idStr);
    if (!item) return null;
    item._collectionFilePath = this.filePath;
    return this._attachSave(item);
  }

  async create(doc) {
    const list = this._read();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      badges: [],
      xp: 0,
      level: 1,
      readiness_score: 0.0,
      extra_documents: [],
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newDoc);
    this._write(list);
    newDoc._collectionFilePath = this.filePath;
    return this._attachSave(newDoc);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = this._read();
    const idStr = id ? id.toString() : '';
    const idx = list.findIndex(item => item._id === idStr);
    if (idx === -1) return null;

    const current = list[idx];
    
    // Simple update simulation
    const setFields = update.$set || update;
    const incFields = update.$inc;
    const pushFields = update.$push;
    const addToSetFields = update.$addToSet;
    const pullFields = update.$pull;

    if (incFields) {
      for (const k in incFields) {
        current[k] = (current[k] || 0) + incFields[k];
      }
    }

    if (pushFields) {
      for (const k in pushFields) {
        if (!current[k]) current[k] = [];
        current[k].push(pushFields[k]);
      }
    }

    if (addToSetFields) {
      for (const k in addToSetFields) {
        if (!current[k]) current[k] = [];
        if (!current[k].includes(addToSetFields[k])) {
          current[k].push(addToSetFields[k]);
        }
      }
    }

    if (pullFields) {
      for (const k in pullFields) {
        if (current[k]) {
          const pullKey = Object.keys(pullFields[k])[0];
          const pullVal = pullFields[k][pullKey];
          current[k] = current[k].filter(item => {
            if (typeof item === 'object' && item !== null) {
              return item[pullKey] !== pullVal;
            }
            return item !== pullFields[k];
          });
        }
      }
    }

    // Merge direct set fields
    for (const k in setFields) {
      // Support nested updates like "level_4_company.company_logo"
      if (k.includes('.')) {
        const parts = k.split('.');
        let obj = current;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!obj[parts[i]]) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = setFields[k];
      } else {
        current[k] = setFields[k];
      }
    }

    current.updatedAt = new Date().toISOString();
    list[idx] = current;
    this._write(list);
    return current;
  }

  async updateOne(query, update) {
    const item = await this.findOne(query);
    if (!item) return { modifiedCount: 0 };
    await this.findByIdAndUpdate(item._id, update);
    return { modifiedCount: 1 };
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }

  async deleteOne(query = {}) {
    const list = this._read();
    const item = list.find(item => {
      for (const key in query) {
        let qVal = query[key];
        let itemVal = item[key];
        if (qVal && typeof qVal === 'object' && qVal.toString) qVal = qVal.toString();
        if (itemVal && typeof itemVal === 'object' && itemVal.toString) itemVal = itemVal.toString();
        if (itemVal !== qVal) return false;
      }
      return true;
    });
    if (!item) return { deletedCount: 0 };
    const updated = list.filter(x => x._id !== item._id);
    this._write(updated);
    return { deletedCount: 1 };
  }

  async deleteMany(query = {}) {
    const list = this._read();
    const updated = list.filter(item => {
      for (const key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    this._write(updated);
    return { deletedCount: list.length - updated.length };
  }

  async insertMany(docs) {
    const list = this._read();
    const newDocs = docs.map(doc => ({
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    }));
    list.push(...newDocs);
    this._write(list);
    return newDocs;
  }

  async findOneAndUpdate(query, update, options = {}) {
    const item = await this.findOne(query);
    if (!item) {
      if (options.upsert) {
        return this.create(query);
      }
      return null;
    }
    return this.findByIdAndUpdate(item._id, update);
  }
}

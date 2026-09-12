import { Schema } from 'mongoose';

/** Transform _id → id and strip __v / passwordHash by default. */
export function toJSONPlugin(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      const obj = ret as Record<string, unknown>;
      obj.id = String(obj._id);
      delete obj._id;
      delete obj.passwordHash;
      delete obj.__v;
      return obj;
    },
  });
  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      const obj = ret as Record<string, unknown>;
      obj.id = String(obj._id);
      delete obj._id;
      return obj;
    },
  });
}

/** Soft-delete helper: exclude documents with deletedAt set unless includeDeleted. */
export function softDeletePlugin(schema: Schema): void {
  schema.add({
    deletedAt: { type: Date, default: null, index: true },
  });

  schema.pre(/^find/, function (this: { getOptions: () => { includeDeleted?: boolean }; where: (q: object) => void }) {
    const opts = this.getOptions?.() || {};
    if (!opts.includeDeleted) {
      this.where({ deletedAt: null });
    }
  });

  schema.methods.softDelete = async function softDelete() {
    this.deletedAt = new Date();
    return this.save();
  };
}

import type { Schema, UpdateResult } from "mongoose";

export function updatedAtPlugin(schema: Schema) {
	schema.post("updateOne", async function (res: UpdateResult) {
		if (res.modifiedCount) {
			const query = this.getQuery();
			const doc = await this.model.findOne(query);
			if (doc) {
				doc.updatedAt = new Date();
				await doc.save();
			}
		}
	});

	schema.post("updateMany", async function (res: UpdateResult) {
		if (res.modifiedCount) {
			// biome-ignore lint/suspicious/noExplicitAny: getQuery() returns a complex type
			const query = this.getQuery() as any;
			await this.model.updateMany(query, { $set: { updatedAt: new Date() } });
		}
	});
}

import type { DocumentType } from "@typegoose/typegoose";
import type { BeAnObject } from "@typegoose/typegoose/lib/types";
import {
	type ClassConstructor,
	instanceToPlain,
	plainToInstance,
} from "class-transformer";

type TypegooseDocument<T> = DocumentType<T, BeAnObject>;

export const mapper = {
	toClass: <T, V>(cls: ClassConstructor<T>, plain: V): T =>
		plainToInstance(cls, plain),

	toPlain: <T>(instance: T): T => {
		return instanceToPlain(instance, {
			excludeExtraneousValues: true,
		}) as T;
	},

	clone: <T>(instance: T, cls?: ClassConstructor<T>): T => {
		const classConstructor =
			cls ?? ((instance as object).constructor as ClassConstructor<T>);
		return plainToInstance(classConstructor, instanceToPlain(instance));
	},

	fromDocument: <TEntity>(
		entity: ClassConstructor<TEntity>,
		document: TypegooseDocument<TEntity>,
	): object => {
		const json = document.toJSON();
		const instance = plainToInstance(entity, json);
		const plain = instanceToPlain(instance, {
			excludeExtraneousValues: true,
		});

		return plain;
	},
};

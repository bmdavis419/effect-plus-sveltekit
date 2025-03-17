/** @internal */
export const unsetMarker = Symbol();
export type UnsetMarker = typeof unsetMarker;

/**
 * Ensures there are no duplicate keys when building a procedure.
 * @internal
 */
export function mergeWithoutOverrides<TType extends Record<string, unknown>>(
	obj1: TType,
	...objs: Partial<TType>[]
): TType {
	const newObj: TType = Object.assign(Object.create(null), obj1);

	for (const overrides of objs) {
		for (const key in overrides) {
			if (key in newObj && newObj[key] !== overrides[key]) {
				throw new Error(`Duplicate key ${key}`);
			}
			newObj[key as keyof TType] = overrides[key] as TType[keyof TType];
		}
	}
	return newObj;
}

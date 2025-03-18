import type { DecoratedMiniQueryRecord, MiniQueryRecord } from './types';

type RouterBuilder = <TRecord extends MiniQueryRecord>(
	queries: TRecord
) => DecoratedMiniQueryRecord<TRecord>;

export const createRouterBuilder = (): RouterBuilder => {
	return (queries) => queries as unknown as DecoratedMiniQueryRecord<typeof queries>;
};

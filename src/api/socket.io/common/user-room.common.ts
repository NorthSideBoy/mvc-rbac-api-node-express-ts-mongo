export const userRoom = {
	self: (id: string): string => `user:self:${id}`,
	watch: (id: string): string => `user:watch:${id}`,
};

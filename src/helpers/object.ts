/**
 * Counts all keys in the object
 *
 * @param {object} object
 * @returns int
 */
export function length(object) {
	return Object.keys(object ?? {}).length;
}

export default function removeNullProperties(obj) {
	Object.keys(obj).forEach((key) => {
		let value = obj[key];
		let hasProperties = value && Object.keys(value).length > 0;
		if (value === null) {
			delete obj[key];
		} else if (typeof value !== 'string' && hasProperties) {
			removeNullProperties(value);
		}
	});
	return obj;
}

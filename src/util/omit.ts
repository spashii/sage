const inProps = (key, props) => {
	return props.some((omitKey) => {
		return omitKey === key;
	});
};

export default function omit(obj, props) {
	let newObj = {};
	Object.keys(obj).forEach((key) => {
		if (!inProps(key, props)) {
			newObj[key] = obj[key];
		}
	});
	return newObj;
}

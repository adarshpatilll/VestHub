import { toTitleCase } from "./toTitleCase";

export const formatSchemeName = (name = "") => {
	let words = name.split("-").map((word) => word.trim());
	words = words.map(
		(word, index) => word + (index < words.length - 1 ? " - " : "")
	);
	return toTitleCase(words.join(""));
};

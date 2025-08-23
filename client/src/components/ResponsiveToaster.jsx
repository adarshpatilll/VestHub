import { Toaster } from "sonner";
import { useEffect, useState } from "react";

const ResponsiveToaster = () => {
	const [position, setPosition] = useState("top-center");

	useEffect(() => {
		const updatePosition = () => {
			if (window.innerWidth < 768) {
				// Mobile
				setPosition("top-center");
			} else {
				// Desktop
				setPosition("top-right");
			}
		};

		updatePosition(); // run initially
		window.addEventListener("resize", updatePosition);

		return () => window.removeEventListener("resize", updatePosition);
	}, []);

	return (
		<Toaster
			closeButton={position === "top-right" ? true : false}
			position={position}
			richColors
			theme="dark"
		/>
	);
};

export default ResponsiveToaster;

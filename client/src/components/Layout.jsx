import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = () => {
	return (
		<div className="h-screen flex flex-col bg-dark text-light">
			<Navbar />

			{/* Add padding-top & padding-bottom equal to nav + footer heights */}
			<main className="h-full flex-1 px-4 pt-18 md:pb-4 pb-20 overflow-y-auto">
				<Outlet />
			</main>

			<Footer />
		</div>
	);
};

export default Layout;

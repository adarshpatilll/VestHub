import { NavLink } from "react-router-dom";
import { IoHomeOutline, IoWalletOutline } from "react-icons/io5";
import { RiAccountCircleLine } from "react-icons/ri";

const links = [
	{
		id: 1,
		to: "/",
		icon: <IoHomeOutline size={18} className="shrink-0" />,
		label: "Home",
	},
	{
		id: 2,
		to: "/funds",
		icon: <IoWalletOutline size={18} className="shrink-0" />,
		label: "Manage Funds",
	},
	{
		id: 3,
		to: "/account",
		icon: <RiAccountCircleLine size={18} className="shrink-0" />,
		label: "Account",
	},
];

const Footer = () => {
	return (
		<footer className="sm:flex md:hidden border-t border-t-neutral-600 flex items-center justify-between gap-2 w-full h-16 text-sm px-2 bg-dark text-light fixed bottom-0 left-0 right-0 z-50">
			{/* links */}

			{links.map(({ id, to, icon, label }) => {
				return (
					<NavLink
						key={id}
						to={to}
						className={({ isActive }) =>
							`px-4 py-1 rounded-md duration-200 flex flex-col items-center gap-1 max-w-[120px] ${
								isActive && "text-yellow-300"
							}`
						}
					>
						{icon}
						<span className="truncate">{label}</span>
					</NavLink>
				);
			})}
		</footer>
	);
};

export default Footer;

import { useState, useEffect } from "react";
import { getCalculations } from "../lib/getCalculations";
import { toast } from "sonner";
import SearchSelect from "../components/SearchSelect";
import { toTitleCase } from "./../lib/toTitleCase";
import BackButtonOrLink from "../components/BackButtonOrLink";
import { useFundsContext } from "../context/FundContext";
import { motion } from "framer-motion";
import CircularLoader from "../components/CircularLoader";

const AddFund = () => {
	const [schemes, setSchemes] = useState([]);
	const [loadingSchemes, setLoadingSchemes] = useState(true);
	const [loadingNav, setLoadingNav] = useState(false);

	const { add, loading, error, categories } = useFundsContext();

	const [fundDetails, setFundDetails] = useState({
		folioNumber: "",
		schemeName: "",
		investedAmount: "",
		units: "",
		nav: "",
		navDate: "",
		category: "",
		currentAmount: "",
		pnl: "",
		returns: "",
	});

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(
					"https://my-nav-rose.vercel.app/api/getList"
				);
				const json = await res.json();
				setSchemes(json.data || []);
			} catch (err) {
				console.error("Failed to fetch schemes", err);
			} finally {
				setLoadingSchemes(false);
			}
		})();
	}, []);

	useEffect(() => {
		if (fundDetails.schemeName) {
			setLoadingNav(true);
			const fetchedNav = schemes.find(
				(s) => s.schemeName === fundDetails.schemeName
			);
			setFundDetails((prev) => ({
				...prev,
				nav: fetchedNav?.latestNav || "",
				navDate: fetchedNav?.navDate || "",
			}));
			setLoadingNav(false);
		}
	}, [fundDetails.schemeName]);

	useEffect(() => {
		if (fundDetails.units && fundDetails.nav && fundDetails.investedAmount) {
			const { current, pnl, returns } = getCalculations(
				fundDetails.units,
				fundDetails.nav,
				fundDetails.investedAmount
			);
			setFundDetails((prev) => ({
				...prev,
				currentAmount: current,
				pnl,
				returns,
			}));
		}
	}, [fundDetails.units, fundDetails.nav, fundDetails.investedAmount]);

	const handleAddFund = async () => {
		const isAllFieldsFilled = Object.values(fundDetails).every(
			(field) => field
		);

		if (!isAllFieldsFilled) {
			toast.error("All fields are required");
			return;
		}

		toast.promise(
			add({
				folioNumber: fundDetails.folioNumber,
				schemeName: fundDetails.schemeName,
				investedAmount: fundDetails.investedAmount,
				currentAmount: fundDetails.currentAmount,
				units: fundDetails.units,
				pnl: fundDetails.pnl,
				returns: fundDetails.returns,
				nav: fundDetails.nav,
				navDate: fundDetails.navDate,
				category: fundDetails.category,
			}),
			{
				loading: "Adding fund...",
				success: () => {
					setFundDetails({
						folioNumber: "",
						schemeName: "",
						investedAmount: "",
						units: "",
						nav: "",
						navDate: "",
						category: "",
						currentAmount: "",
						pnl: "",
						returns: "",
					});
					return "Fund added successfully";
				},
				error: (error) => {
					return `Failed to add fund: ${error.message || error}`;
				},
			}
		);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFundDetails((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	if (loadingSchemes) {
		return <CircularLoader label="Loading Schemes..." />;
	}

	return (
		<motion.div
			className="bg-dark flex min-h-full items-center justify-center md:items-start"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
		>
			<motion.div
				className="bg-dark text-light w-full max-w-md space-y-8 rounded-2xl p-1 pt-0 md:max-w-full md:space-y-16 md:p-6 md:pt-0"
				initial={{ y: 40, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
			>
				{/* Header */}
				<motion.div
					className="flex items-center justify-between"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<h2 className="text-lg font-semibold">Add Funds</h2>
					<BackButtonOrLink isLink={true} />
				</motion.div>
				{/* Form */}
				<motion.div
					className="grid gap-4 md:grid-cols-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
				>
					{/* Folio Number */}
					<div className="flex flex-col">
						<label className="text-sm">Folio Number</label>
						<input
							type="text"
							value={fundDetails.folioNumber}
							name="folioNumber"
							onChange={handleChange}
							className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 p-3"
						/>
					</div>

					{/* Scheme Name */}
					<div className="flex flex-col">
						<SearchSelect
							label="Scheme Name"
							value={fundDetails.schemeName}
							onChange={(val) =>
								setFundDetails((prev) => ({ ...prev, schemeName: val }))
							}
							options={schemes.map((s) => ({
								label: s.schemeName,
								value: s.schemeName,
							}))}
						/>
					</div>

					{/* Category */}
					<div className="flex flex-col">
						<SearchSelect
							label="Category"
							value={toTitleCase(fundDetails.category)}
							allowCreate={true}
							onChange={(val) =>
								setFundDetails((prev) => ({
									...prev,
									category: val.toLowerCase(),
								}))
							}
							options={categories.map((c) => ({
								label: toTitleCase(c.name),
								value: c.name.toLowerCase(),
							}))}
						/>
					</div>

					{/* Invested Amount */}
					<div className="flex flex-col">
						<label className="text-sm">Invested Amount</label>
						<input
							type="number"
							value={fundDetails.investedAmount}
							name="investedAmount"
							onChange={handleChange}
							className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 p-3"
						/>
					</div>

					{/* Units */}
					<div className="flex flex-col">
						<label className="text-sm">Units</label>
						<input
							type="number"
							value={fundDetails.units}
							name="units"
							onChange={handleChange}
							className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 p-3"
						/>
					</div>

					{/* NAV */}
					<div className="flex flex-col">
						<label className="text-sm">NAV</label>
						<input
							type="text"
							value={loadingNav ? "Loading..." : fundDetails.nav}
							readOnly
							className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
						/>
					</div>

					{/* NAV Date */}
					<div className="flex flex-col">
						<label className="text-sm">NAV Date</label>
						<input
							type="text"
							value={fundDetails.navDate}
							readOnly
							className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
						/>
					</div>

					{/* Current Amount */}
					<div className="flex flex-col">
						<label className="text-sm">Current Amount</label>
						<input
							type="text"
							value={fundDetails.currentAmount}
							readOnly
							className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
						/>
					</div>

					{/* PnL */}
					<div className="flex flex-col">
						<label className="text-sm">PnL</label>
						<input
							type="text"
							value={fundDetails.pnl}
							readOnly
							className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
						/>
					</div>

					{/* Returns */}
					<div className="flex flex-col">
						<label className="text-sm">Returns %</label>
						<input
							type="text"
							value={
								fundDetails.returns ? `${fundDetails.returns}%` : ""
							}
							readOnly
							className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
						/>
					</div>
				</motion.div>
				<div className="flex justify-center px-4">
					<motion.button
						onClick={handleAddFund}
						disabled={loading}
						className={`w-full max-w-xs rounded-lg bg-yellow-600 p-3 font-medium hover:bg-yellow-700 ${
							loading ? "cursor-not-allowed bg-yellow-700" : ""
						}`}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.5, duration: 0.3 }}
					>
						{loading ? "Adding..." : "Add Fund"}
					</motion.button>
				</div>
				 ̰
			</motion.div>
		</motion.div>
	);
};

export default AddFund;

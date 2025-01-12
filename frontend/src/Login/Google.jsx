import Button from "components/Button";
import { login } from "./functions";

export default function GoogleLogin({ callback, redirect, text }) {
	return (
		<Button
			className="btn btn-info bg-white text-black gap-1 items-center flex flex-nowrap"
			onClick={async () => {
				const res = await login(redirect);
				if (res && callback) {
					callback();
				}
			}}
		>
			<img
				className="padded-logo"
				src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
				alt="google drive"
			/>
			{
				!text ? "Login to Google" : text
			}
		</Button>
	);
}

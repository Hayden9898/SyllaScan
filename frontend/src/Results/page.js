import { Outlet } from "react-router-dom";


export default function Results({ results }) {
    return (
        <div className="flex flex-col items-center">
            <Outlet />
        </div>
    )
}
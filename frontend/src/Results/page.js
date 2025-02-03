import { Outlet } from "react-router-dom";
import "css/Results.css"

export default function Results({ results }) {
    return (
        <div className="container">
                <Outlet />
        </div>
    )
}
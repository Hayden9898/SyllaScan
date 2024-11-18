import '../css/LoaderScreen.css';

export default function Loader({message}) {
    return (
        <div className="center-components">
            <div className="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <h1 className="processing-title">{message}</h1>
        </div>
    );
};
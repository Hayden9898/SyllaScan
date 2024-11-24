export default function Results({ results, setScreen }) {
    return (
        <div>
            <h1>Results</h1>
            <div id="results">
                {JSON.stringify(results.response, null, 2)}
            </div>
        </div>
    )
}
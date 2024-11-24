export function handleSignOut(authToken, setAuthToken, setScreen) {
    if (!authToken) {
        console.warn("No access token available for revocation");
        return;
    }

    loadGoogleScript(() => {
        if (window.google && window.google.accounts) {
            // eslint-disable-next-line no-undef
            google.accounts.oauth2.revoke(authToken, () => {
                console.log("Access token revoked successfully");
                setAuthToken(null);
                setScreen("home");
            });
        } else {
            console.error("Google API is not available");
        }
    });
}

function loadGoogleScript(callback) {
    const existingScript = document.getElementById("google-client-script");
    if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.id = "google-client-script";
        script.async = true;
        script.defer = true;
        script.onload = callback;
        document.body.appendChild(script);
    } else {
        callback(); // Script already loaded
    }
}
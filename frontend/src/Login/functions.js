export async function login(redirect, scopes) {
    const hasAccess = await checkScopes(scopes);
    if (!hasAccess) {
        const redirect_uri = redirect ? `?redirect_to=${encodeURIComponent(redirect)}` : "";
        window.location.href = `http://localhost:8000/oauth/google${redirect_uri}`;
    }
    return hasAccess;
}

export async function checkScopes(scopes) {
    console.log(scopes)
    const res = await fetch("http://localhost:8000/oauth/google/check_scopes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            scopes: scopes
        }),
    });
    console.log(res)
    if (!res.ok) {
        throw new Error("Failed to check Google scopes");
    }
    const hasAccess = await res.json();
    console.log(hasAccess)
    return hasAccess.has_scopes;
}

export async function handleSignOut() {
    window.location.href = "http://localhost:8000/oauth/google/revoke";
}

export async function checkLoginStatus() {
    const res = await fetch("http://localhost:8000/oauth/google/check_auth", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });
    if (!res.ok) {
        throw new Error("Failed to check login status");
    }
    const loggedIn = await res.json();
    return loggedIn;
}